import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { map, Observable } from 'rxjs';
import { DataTypeConstants } from '../../content-type-fields/constants/data-type.constants';
import { Field } from '../../content-type-fields/models/field.model';
import { webApiFieldsAll } from '../../content-type-fields/services/content-types-fields.service';
import { MoreSnippet, SetSnippet, SetSnippetLink, Snippet, SnippetsSets, SnippetsSubSubSets } from '../models/snippet.model';
import { SourceView } from '../models/source-view.model';

@Injectable()
export class SnippetsService {

  constructor(private http: HttpClient, private dnnContext: DnnContext, private translate: TranslateService) { }

  getSnippets(view: SourceView): Observable<{ list: Snippet[]; sets: SnippetsSets; }> {
    return this.http.get<{ snippets: Snippet[] }>('../ng-assets/snippets.json.js').pipe(
      map(res => {
        const relevant = this.filterAwayNotNeededSnippetsList(res.snippets, view);
        const standardAndInputSnips = this.extractInputTypeSnippets(relevant);
        const sets = this.initSnippetsWithConfig(standardAndInputSnips.standardArray, view, standardAndInputSnips.inputTypeSnippets);
        const sorted: { list: Snippet[]; sets: SnippetsSets; } = {
          list: standardAndInputSnips.standardArray,
          sets
        };
        return sorted;
      }),
    );
  }

  /** Scan the list for sets starting with @ or [ and filter if not needed right now */
  private filterAwayNotNeededSnippetsList(list: Snippet[], view: SourceView): Snippet[] {
    const keyPrefixes = ['@', '['];
    const keyPrefixIndex = (v: SourceView) => (v.Type.indexOf('Razor') > -1) ? 0 : 1;

    const newList: Snippet[] = [];
    for (const itm of list) {
      const setHasPrefix = keyPrefixes.indexOf(itm.set[0]);
      if (setHasPrefix === -1 || (setHasPrefix === keyPrefixIndex(view))) {
        // if necessary, remove first char
        if (setHasPrefix === keyPrefixIndex(view)) {
          itm.set = itm.set.substring(1);
        }
        newList.push(itm);
      }
    }
    return newList;
  }

  private extractInputTypeSnippets(list: Snippet[]): { standardArray: Snippet[]; inputTypeSnippets: Record<string, Snippet[]>; } {
    const standardArray: Snippet[] = [];
    const inputTypeArray: Snippet[] = [];

    for (const itm of list) {
      const systemSnippet = itm.set[0] === '\\';
      if (!systemSnippet) {
        standardArray.push(itm);
      } else {
        itm.set = itm.set.substring(1);
        inputTypeArray.push(itm);
      }
    }
    const inputTypeSnippets = this.catalogInputTypeSnippets(inputTypeArray);
    const extracted: { standardArray: Snippet[]; inputTypeSnippets: Record<string, Snippet[]>; } = {
      standardArray,
      inputTypeSnippets,
    };
    return extracted;
  }

  private catalogInputTypeSnippets(list: Snippet[]): Record<string, Snippet[]> {
    const inputTypeList: Record<string, Snippet[]> = {};
    for (const itm of list) {
      if (inputTypeList[itm.subset] === undefined) {
        inputTypeList[itm.subset] = [];
      }
      inputTypeList[itm.subset].push(itm);
    }
    return inputTypeList;
  }

  private initSnippetsWithConfig(
    standardArray: Snippet[],
    templateConfiguration: SourceView,
    inputTypeSnippets: Record<string, Snippet[]>,
  ): SnippetsSets {
    const sets = this.makeTree(standardArray);

    // retrieve all relevant content-types and infos
    sets.Content = Object.assign({}, sets.Content, { Fields: {}, PresentationFields: {} });
    if (templateConfiguration.TypeContent) {
      this.loadContentType(
        sets.Content.Fields as SnippetsSubSubSets,
        templateConfiguration.TypeContent,
        'Content',
        templateConfiguration,
        inputTypeSnippets,
      );
    }
    if (templateConfiguration.TypeContentPresentation) {
      this.loadContentType(
        sets.Content.PresentationFields as SnippetsSubSubSets,
        templateConfiguration.TypeContentPresentation,
        'Content.Presentation',
        templateConfiguration,
        inputTypeSnippets,
      );
    }

    if (templateConfiguration.HasList) {
      sets.List = Object.assign({}, sets.List, { Fields: {}, PresentationFields: {} });
      if (templateConfiguration.TypeList) {
        this.loadContentType(
          sets.List.Fields as SnippetsSubSubSets,
          templateConfiguration.TypeList,
          'Header',
          templateConfiguration,
          inputTypeSnippets,
        );
      }
      if (templateConfiguration.TypeListPresentation) {
        this.loadContentType(
          sets.List.PresentationFields as SnippetsSubSubSets,
          templateConfiguration.TypeListPresentation,
          'Header.Presentation',
          templateConfiguration,
          inputTypeSnippets,
        );
      }
    } else {
      delete sets.List;
    }

    // maybe App-infos
    if (templateConfiguration.HasApp) {
      sets.App.Resources = {};
      sets.App.Settings = {};
      this.loadContentType(sets.App.Resources, 'App-Resources', 'App.Resources', templateConfiguration, inputTypeSnippets);
      this.loadContentType(sets.App.Settings, 'App-Settings', 'App.Settings', templateConfiguration, inputTypeSnippets);
    }

    return sets;
  }

  /** Convert the list into a tree with set/subset/item */
  private makeTree(list: Snippet[]): SnippetsSets {
    const tree: SnippetsSets = {};
    for (const o of list) {
      if (tree[o.set] === undefined) {
        tree[o.set] = {};
      }
      if (tree[o.set][o.subset] === undefined) {
        tree[o.set][o.subset] = [];
      }
      const reformatted: SetSnippet = {
        key: o.name,
        label: this.label(o.set, o.subset, o.name),
        snip: o.content,
        help: o.help || this.help(o.set, o.subset, o.name),
        links: this.linksList(o.links)
      };

      (tree[o.set][o.subset] as SetSnippet[]).push(reformatted);
    }
    return tree;
  }

  private label(set: string, subset: string, snip: string): string {
    const key = this.getHelpKey(set, subset, snip, '.Key');

    let result: string = this.translate.instant(key);
    if (result === key) {
      result = snip;
    }
    return result;
  }

  private getHelpKey(set: string, subset: string, snip: string, addition: string): string {
    return 'SourceEditorSnippets' + '.' + set + '.' + subset + '.' + snip + addition;
  }

  private help(set: string, subset: string, snip: string): string {
    const key = this.getHelpKey(set, subset, snip, '.Help');

    let result: string = this.translate.instant(key);
    if (result === key) {
      result = '';
    }
    return result;
  }

  private linksList(linksString: string): SetSnippetLink[] {
    if (!linksString) { return null; }

    const links: SetSnippetLink[] = [];
    const llist = linksString.split('\n');
    for (const l of llist) {
      const pair = l.split(':');
      if (pair.length === 3) {
        const link: SetSnippetLink = {
          name: pair[0].trim(),
          url: pair[1].trim() + ':' + pair[2].trim(),
        };
        links.push(link);
      }
    }
    if (links.length === 0) { return null; }
    return links;
  }

  /** spm TODO: this happens after snippets are calculated for the first time. Needs to be fixed */
  private loadContentType(
    target: SnippetsSubSubSets,
    type: string,
    prefix: string,
    templateConfiguration: SourceView,
    inputTypeSnippets: Record<string, Snippet[]>,
  ): void {
    this.getFields(templateConfiguration.AppId, type).subscribe(fields => {
      // first add common items if the content-type actually exists
      for (const field of fields) {
        const fieldname = field.StaticName;
        target[fieldname] = {
          key: fieldname,
          label: fieldname,
          snip: this.valuePlaceholder(prefix, fieldname, templateConfiguration),
          help: field.Metadata.merged.Notes || ' (' + field.Type.toLowerCase() + ') '
        };
        // try to add generic snippets specific to this input-type
        const snipDefaults = cloneDeep(target[fieldname]); // must be a copy, because target[fieldname] will grow
        this.attachSnippets(target, prefix, fieldname, field.InputType, snipDefaults, inputTypeSnippets);
      }

      if (fields.length) {
        const std = ['EntityId', 'EntityTitle', 'EntityGuid', 'EntityType', 'IsPublished', 'Modified'];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < std.length; i++) {
          target[std[i]] = {
            key: std[i],
            label: std[i],
            snip: this.valuePlaceholder(prefix, std[i], templateConfiguration),
            help: this.translate.instant('SourceEditorSnippets.StandardFields.' + std[i] + '.Help'),
          };
        }
      }
    });
  }

  private valuePlaceholder(obj: string, val: string, templateConfiguration: SourceView): string {
    return (templateConfiguration.Type.indexOf('Razor') > -1)
      ? '@' + obj + '.' + val
      : '[' + obj.replace('.', ':') + ':' + val + ']';
  }

  private getFields(appId: number, staticName: string): Observable<Field[]> {
    return this.http.get<Field[]>(this.dnnContext.$2sxc.http.apiUrl(webApiFieldsAll), {
      params: { appid: appId.toString(), staticName },
    }).pipe(
      map(fields => {
        fields = fields.filter(field => field.Type !== DataTypeConstants.Empty);
        for (const fld of fields) {
          if (!fld.Metadata) { continue; }
          const md = fld.Metadata;
          const allMd = md.All;
          const typeMd = md[fld.Type];
          const inputMd = md[fld.InputType];
          md.merged = { ...allMd, ...typeMd, ...inputMd };
        }
        return fields;
      }),
    );
  }

  private attachSnippets(
    target: SnippetsSubSubSets,
    prefix: string,
    fieldname: string,
    inputType: string,
    snipDefaults: SetSnippet,
    inputTypeSnippets: Record<string, Snippet[]>,
  ): void {
    let genericSnippet = inputTypeSnippets[inputType];
    if (inputType.indexOf('-')) { // if it's a sub-type, let's also get the master-type
      const fieldType = inputType.substring(0, inputType.indexOf('-'));
      if (fieldType) {
        const typeSnips = inputTypeSnippets[fieldType];
        if (typeSnips) {
          genericSnippet = genericSnippet ? genericSnippet.concat(typeSnips) : typeSnips;
        }
      }
    }
    if (!genericSnippet) { return; }

    if (target[fieldname].more === undefined) {
      target[fieldname].more = {};
    }
    const fieldSnips = target[fieldname].more;
    // tslint:disable-next-line:prefer-for-of
    for (let g = 0; g < genericSnippet.length; g++) {
      try {
        fieldSnips[fieldname + '-' + genericSnippet[g].name] = Object.assign({}, snipDefaults, {
          key: fieldname + ' - ' + genericSnippet[g].name,
          label: genericSnippet[g].name,
          snip: this.localizeGenericSnippet(genericSnippet[g].content, prefix, fieldname),
          collapse: true,
        } as MoreSnippet);
      } finally { }
    }
  }

  private localizeGenericSnippet(snip: string, objName: string, fieldName: string): string {
    snip = snip
      .replace(/(\$\{[0-9]+\:)var(\})/gi, '$1' + objName + '$2')
      .replace(/(\$\{[0-9]+\:)prop(\})/gi, '$1' + fieldName + '$2');
    return snip;
  }
}
