import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import cloneDeep from 'lodash-es/cloneDeep';

import { SourceView } from '../models/source-view.model';
import { Snippet } from '../models/snippet.model';
import { Field } from '../../content-type-fields/models/field.model';

@Injectable()
export class SnippetsService {
  private keyPrefixes = ['@', '['];
  private keyPrefixIndex = (view: SourceView) => (view.Type.indexOf('Razor') > -1) ? 0 : 1;

  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    private translate: TranslateService,
  ) { }

  async getSnippets(view: SourceView) {
    const res: any = await this.http.get('../sxc-develop/snippets.json.js').toPromise();
    const snippets: Snippet[] = res.snippets;
    const relevant = this.filterAwayNotNeededSnippetsList(snippets, view);
    const standAndInputSnips = this.extractInputTypeSnippets(relevant);
    const sets = this.initSnippetsWithConfig(standAndInputSnips.standardArray, view, standAndInputSnips.inputTypeSnippets);
    return { sets, list: standAndInputSnips.standardArray };
  }

  // scan the list for sets starting with @ or [ and filter if not needed right now
  private filterAwayNotNeededSnippetsList(list: Snippet[], view: SourceView) {
    const newList = [];
    for (const itm of list) {
      const setHasPrefix = this.keyPrefixes.indexOf(itm.set[0]);
      if (setHasPrefix === -1 || (setHasPrefix === this.keyPrefixIndex(view))) {
        // if necessary, remove first char
        if (setHasPrefix === this.keyPrefixIndex(view)) {
          itm.set = itm.set.substr(1);
        }
        newList.push(itm);
      }
    }
    return newList;
  }

  private extractInputTypeSnippets(list: Snippet[]) {
    const standardArray: Snippet[] = [];
    const inputTypeArray: Snippet[] = [];

    for (const itm of list) {
      const systemSnippet = itm.set[0] === '\\';
      if (!systemSnippet) {
        standardArray.push(itm);
      } else {
        itm.set = itm.set.substr(1);
        inputTypeArray.push(itm);
      }
    }
    const inputTypeSnippets = this.catalogInputTypeSnippets(inputTypeArray);
    return {
      standardArray,
      inputTypeSnippets,
    };
  }

  private catalogInputTypeSnippets(list: Snippet[]) {
    const inputTypeList: any = {};
    for (const itm of list) {
      if (inputTypeList[itm.subset] === undefined) {
        inputTypeList[itm.subset] = [];
      }
      inputTypeList[itm.subset].push(itm);
    }
    return inputTypeList;
  }

  private initSnippetsWithConfig(sets: any, templateConfiguration: SourceView, inputTypeSnippets: any) {
    sets = this.makeTree(sets);

    // retrieve all relevant content-types and infos
    sets.Content = Object.assign({}, sets.Content, { Fields: {}, PresentationFields: {} });
    if (templateConfiguration.TypeContent) {
      this.loadContentType(sets.Content.Fields, templateConfiguration.TypeContent, 'Content', templateConfiguration, inputTypeSnippets);
    }
    if (templateConfiguration.TypeContentPresentation) {
      this.loadContentType(
        sets.Content.PresentationFields, templateConfiguration.TypeContentPresentation,
        'Content.Presentation', templateConfiguration, inputTypeSnippets,
      );
    }

    if (templateConfiguration.HasList) {
      sets.List = Object.assign({}, sets.List, { Fields: {}, PresentationFields: {} });
      if (templateConfiguration.TypeList) {
        this.loadContentType(sets.List.Fields, templateConfiguration.TypeList, 'ListContent', templateConfiguration, inputTypeSnippets);
      }
      if (templateConfiguration.TypeListPresentation) {
        this.loadContentType(
          sets.List.PresentationFields, templateConfiguration.TypeListPresentation,
          'ListContent.Presentation', templateConfiguration, inputTypeSnippets,
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

  // Convert the list into a tree with set/subset/item
  private makeTree(list: Snippet[]) {
    const tree: any = {};
    for (const o of list) {
      if (tree[o.set] === undefined) {
        tree[o.set] = {};
      }
      if (tree[o.set][o.subset] === undefined) {
        tree[o.set][o.subset] = [];
      }
      const reformatted = {
        key: o.name,
        label: this.label(o.set, o.subset, o.name),
        snip: o.content,
        help: o.help || this.help(o.set, o.subset, o.name),
        links: this.linksList(o.links)
      };

      tree[o.set][o.subset].push(reformatted);
    }
    return tree;
  }

  private label(set: any, subset: any, snip: any) {
    const key = this.getHelpKey(set, subset, snip, '.Key');

    let result = this.translate.instant(key);
    if (result === key) {
      result = snip;
    }
    return result;
  }

  private getHelpKey(set: any, subset: any, snip: any, addition: any) {
    return 'SourceEditorSnippets' + '.' + set + '.' + subset + '.' + snip + addition;
  }

  private help(set: any, subset: any, snip: any) {
    const key = this.getHelpKey(set, subset, snip, '.Help');

    let result = this.translate.instant(key);
    if (result === key) {
      result = '';
    }
    return result;
  }

  private linksList(linksString: any) {
    if (!linksString) {
      return null;
    }
    const links = [];
    const llist = linksString.split('\n');
    for (const l of llist) {
      const pair = l.split(':');
      if (pair.length === 3) {
        links.push({ name: pair[0].trim(), url: pair[1].trim() + ':' + pair[2].trim() });
      }
    }
    if (links.length === 0) { return null; }
    return links;
  }

  // get fields in content types
  private loadContentType(target: any, type: any, prefix: any, templateConfiguration: SourceView, inputTypeSnippets: any) {
    this.getFields(templateConfiguration.AppId, type)
      .then(fields => {
        // first add common items if the content-type actually exists
        for (const value of fields) {
          const fieldname = value.StaticName;
          target[fieldname] = {
            key: fieldname,
            label: fieldname,
            snip: this.valuePlaceholder(prefix, fieldname, templateConfiguration),
            help: value.Metadata.merged.Notes || '' + ' (' + value.Type.toLowerCase() + ') '
          };
          // try to add generic snippets specific to this input-type
          const snipDefaults = cloneDeep(target[fieldname]); // must be a copy, because target[fieldname] will grow

          this.attachSnippets(target, prefix, fieldname, value.InputType, snipDefaults, inputTypeSnippets);
        }

        const std = ['EntityId', 'EntityTitle', 'EntityGuid', 'EntityType', 'IsPublished', 'Modified'];
        if (fields.length) {
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

  private valuePlaceholder(obj: any, val: any, templateConfiguration: any) {
    return (templateConfiguration.Type.indexOf('Razor') > -1)
      ? '@' + obj + '.' + val
      : '[' + obj.replace('.', ':') + ':' + val + ']';
  }

  private getFields(appId: number, staticName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/getfields'), {
      params: { appid: appId.toString(), staticName },
    })
      .toPromise()
      .then((fields: Field[]) => {
        if (fields) {
          for (const fld of fields) {
            if (!fld.Metadata) { continue; }
            const md = fld.Metadata;
            const allMd = md.All;
            const typeMd = md[fld.Type];
            const inputMd = md[fld.InputType];
            md.merged = { ...allMd, ...typeMd, ...inputMd };
          }
        }
        return fields;
      });
  }

  private attachSnippets(target: any, prefix: any, fieldname: any, inputType: any, snipDefaults: any, inputTypeSnippets: any) {
    let genericSnippet = inputTypeSnippets[inputType];
    if (inputType.indexOf('-')) {   // if it's a sub-type, let's also get the master-type
      const fieldType = inputType.substr(0, inputType.indexOf('-'));
      if (fieldType) {
        const typeSnips = inputTypeSnippets[fieldType];
        if (typeSnips) {
          genericSnippet = genericSnippet ? genericSnippet.concat(typeSnips) : typeSnips;
        }
      }
    }
    if (!genericSnippet) {
      return;
    }

    if (target[fieldname].more === undefined) {
      target[fieldname].more = [];
    }
    const fieldSnips = target[fieldname].more;
    // tslint:disable-next-line:prefer-for-of
    for (let g = 0; g < genericSnippet.length; g++) {
      try {
        fieldSnips[fieldname + '-' + genericSnippet[g].name] = Object.assign({}, snipDefaults, {
          key: fieldname + ' - ' + genericSnippet[g].name,
          label: genericSnippet[g].name,
          snip: this.localizeGenericSnippet(genericSnippet[g].content, prefix, fieldname),
          collapse: true
        });
      } finally { }
    }
  }

  private localizeGenericSnippet(snip: any, objName: any, fieldName: any) {
    snip = snip.replace(/(\$\{[0-9]+\:)var(\})/gi, '$1' + objName + '$2')
      .replace(/(\$\{[0-9]+\:)prop(\})/gi, '$1' + fieldName + '$2');
    return snip;
  }
}
