import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { AdamService } from '../adam.service';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { FeatureService } from '../../../shared/store/ngrx-data/feature.service';
import { AdamConfigInstance } from './adam-browser.models';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { eavConstants } from '../../../../ng-dialogs/src/app/shared/constants/eav.constants';
import { UrlHelper } from '../../../shared/helpers/url-helper';
import { FeaturesGuidsConstants } from '../../../../shared/features-guids.constants';
import { EditForm } from '../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { EavService } from '../../../shared/services/eav.service';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { AdamItem, AdamConfig, DropzoneConfigExt } from '../../../../edit-types';
import { paramEncode } from '../../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-browser',
  templateUrl: './adam-browser.component.html',
  styleUrls: ['./adam-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('adamShowAnimate', [
      state('closed', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        overflow: 'hidden'
      })),
      transition('closed => open', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ])
    ])
  ]
})
export class AdamBrowserComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  @Output() openUpload: EventEmitter<any> = new EventEmitter<any>();

  value$: Observable<string>;
  disabled$: Observable<boolean>;
  expanded$: Observable<boolean>;
  adamConfig$ = new BehaviorSubject<AdamConfig>(null);
  items$ = new BehaviorSubject<AdamItem[]>([]);
  pasteClipboardImage: boolean;

  private control: AbstractControl;
  private url: string;
  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private adamService: AdamService,
    private fileTypeService: FileTypeService,
    private featureService: FeatureService,
    private router: Router,
    private route: ActivatedRoute,
    private dnnContext: DnnContext,
    private eavService: EavService,
    private expandableFieldService: ExpandableFieldService,
    private zone: NgZone,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
  }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.refreshOnChildClosed();
    const contentType = this.config.entity.header.ContentTypeName;
    const entityGuid = this.config.entity.header.Guid;
    const field = this.config.field.name;
    this.url = this.dnnContext.$2sxc.http.apiUrl(`app-content/${contentType}/${entityGuid}/${field}`);
    this.pasteClipboardImage = this.featureService.isFeatureEnabled(FeaturesGuidsConstants.PasteImageFromClipboard);

    // run inside zone to detect changes when called from custom components
    this.config.adam = {
      items$: this.items$.asObservable(),
      toggle: (usePortalRoot, showImagesOnly) => {
        this.zone.run(() => {
          this.toggle(usePortalRoot, showImagesOnly);
        });
      },
      setConfig: (config) => {
        this.zone.run(() => {
          this.setConfig(config);
        });
      },
      getConfig: () => this.adamConfig$.value,
      getConfig$: () => this.adamConfig$.asObservable(),
      onItemClick: () => { return; },
      onItemUpload: () => { return; },
      refresh: () => {
        this.zone.run(() => {
          this.fetchItems();
        });
      },
      addFullPath: (item) => { this.adamService.addFullPath(item); }
    };
    this.subscription.add(this.adamConfig$.subscribe(adamConfig => {
      this.fetchItems();
    }));
    this.expanded$ = this.expandableFieldService.getObservable().pipe(map(expandedFieldId => expandedFieldId === this.config.field.index));
    this.value$ = this.eavService.formSetValueChange$.pipe(
      filter(formSet => (formSet.formId === this.config.form.formId) && (formSet.entityGuid === this.config.entity.entityGuid)),
      map(formSet => this.control.value),
      startWith(this.control.value),
      distinctUntilChanged(),
    );
    this.disabled$ = this.eavService.formDisabledChanged$$.asObservable().pipe(
      filter(formDisabledSet => (formDisabledSet.formId === this.config.form.formId)
        && (formDisabledSet.entityGuid === this.config.entity.entityGuid)
      ),
      map(formSet => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );
  }

  ngOnDestroy() {
    this.adamConfig$.complete();
    this.items$.complete();
    this.subscription.unsubscribe();
  }

  addFolder() {
    if (this.control.disabled) { return; }

    const folderName = window.prompt('Please enter a folder name'); // todo i18n
    if (!folderName) { return; }

    this.adamService.addFolder(folderName, this.url, this.adamConfig$.value).subscribe(res => {
      this.fetchItems();
    });
  }

  del(item: AdamItem) {
    if (this.control.disabled) { return; }

    const ok = window.confirm('Are you sure you want to delete this item?'); // todo i18n
    if (!ok) { return; }

    this.adamService.deleteItem(item, this.url, this.adamConfig$.value).subscribe(res => {
      this.fetchItems();
    });
  }

  addItemMetadata(adamItem: AdamItem) {
    const form: EditForm = {
      items: [{
        ContentTypeName: adamItem._metadataContentType,
        For: {
          Target: eavConstants.metadata.cmsObject.target,
          String: (adamItem.Type === 'folder' ? 'folder' : 'file') + ':' + adamItem.Id,
        }
      }],
    };
    this.router.navigate([`edit/${paramEncode(JSON.stringify(form))}`], { relativeTo: this.route });
  }

  editItemMetadata(metadataId: string) {
    const form: EditForm = {
      items: [{ EntityId: metadataId.toString() }],
    };
    this.router.navigate([`edit/${paramEncode(JSON.stringify(form))}`], { relativeTo: this.route });
  }

  goUp() {
    let subfolder = this.adamConfig$.value.subfolder;
    subfolder = subfolder.includes('/') ? subfolder.slice(0, subfolder.lastIndexOf('/')) : '';
    this.config.adam.setConfig({ subfolder });
  }

  private getMetadataContentType(item: AdamItem) {
    let found: string[];

    // check if it's a folder and if this has a special registration
    if (item.Type === 'folder') {
      found = this.adamConfig$.value.metadataContentTypes.match(/^(folder)(:)([^\n]*)/im);
      if (found) {
        return found[3];
      } else {
        return null;
      }
    }

    // check if the extension has a special registration
    // -- not implemented yet

    // check if the type "image" or "document" has a special registration
    // -- not implemented yet

    // nothing found so far, go for the default with nothing as the prefix
    found = this.adamConfig$.value.metadataContentTypes.match(/^([^:\n]*)(\n|$)/im);
    if (found) { return found[1]; }

    // this is if we don't find anything
    return null;
  }

  goIntoFolder(item: AdamItem) {
    let subfolder = this.adamConfig$.value.subfolder;
    subfolder = subfolder ? `${subfolder}/${item.Name}` : item.Name;
    this.config.adam.setConfig({ subfolder });
  }

  openUploadClick(event: MouseEvent) {
    this.openUpload.emit();
  }

  rename(item: AdamItem) {
    if (this.control.disabled) { return; }

    const newName = window.prompt('Rename the file / folder to: ', item.Name);
    if (!newName) { return; }

    this.adamService.rename(item, newName, this.url, this.adamConfig$.value).subscribe(res => {
      this.fetchItems();
    });
  }

  select(item: AdamItem) {
    if (this.control.disabled || !this.adamConfig$.value.enableSelect) { return; }
    this.config.adam.onItemClick(item);
  }

  private fetchItems() {
    const adamConfig = this.adamConfig$.value;
    if (adamConfig == null) { return; }
    if (!adamConfig.autoLoad) { return; }
    this.adamService.getAll(this.url, adamConfig).subscribe(items => {
      const filteredItems: AdamItem[] = [];
      const allowedFileTypes = adamConfig.fileFilter
        ? adamConfig.fileFilter.split(',').map(extension => extension.replace('*', '').trim())
        : [];

      for (const item of items) {
        if (item.Name === '.') { // is root
          const allowEdit = item.AllowEdit;
          if (allowEdit !== adamConfig.allowEdit) {
            this.config.adam.setConfig({ allowEdit });
          }
          continue;
        }
        if (item.Name === '2sxc' || item.Name === 'adam') { continue; }
        if (!item.IsFolder && adamConfig.showImagesOnly && item.Type !== 'image') { continue; }
        if (item.IsFolder && adamConfig.maxDepthReached) { continue; }
        if (allowedFileTypes.length > 0) {
          const extension = item.Name.substring(item.Name.lastIndexOf('.'));
          if (!allowedFileTypes.includes(extension)) { continue; }
        }

        item._metadataContentType = this.getMetadataContentType(item);
        item._icon = this.fileTypeService.getIconClass(item.Name);
        item._isMaterialIcon = this.fileTypeService.isKnownType(item.Name);
        item._displaySize = (item.Size / 1024).toFixed(0);
        filteredItems.push(item);
      }

      filteredItems.sort((a, b) => a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase()));
      filteredItems.sort((a, b) => b.IsFolder.toString().localeCompare(a.IsFolder.toString()));
      this.items$.next(filteredItems);
    });
  }

  private toggle(usePortalRoot: boolean, showImagesOnly: boolean) {
    const newConfig = { ...this.adamConfig$.value, ...{ usePortalRoot, showImagesOnly } };
    if (JSON.stringify(newConfig) === JSON.stringify(this.adamConfig$.value)) {
      newConfig.autoLoad = !newConfig.autoLoad;
    } else if (!newConfig.autoLoad) {
      newConfig.autoLoad = true;
    }
    this.config.adam.setConfig(newConfig);
  }

  trackByFn(index: number, item: AdamItem) {
    return item.Id;
  }

  private setConfig(config: Partial<AdamConfig>) {
    // set new values and use old ones where new value is not provided
    const startDisabled = this.config.field.isExternal;
    const oldConfig = (this.adamConfig$.value != null) ? this.adamConfig$.value : new AdamConfigInstance(startDisabled);
    const newConfig = new AdamConfigInstance(startDisabled);
    const newConfigKeys = Object.keys(newConfig);
    for (const key of newConfigKeys) {
      (newConfig as any)[key] = ((config as any)[key] != null) ? (config as any)[key] : (oldConfig as any)[key];
    }

    // fixes
    const resetSubfolder = oldConfig.usePortalRoot !== newConfig.usePortalRoot;
    if (resetSubfolder) {
      newConfig.subfolder = '';
    }
    if (newConfig.usePortalRoot) {
      const fixBackSlashes = newConfig.rootSubfolder.includes('\\');
      if (fixBackSlashes) {
        newConfig.rootSubfolder = newConfig.rootSubfolder.replace(/\\/g, '/');
      }
      const fixStartingSlash = newConfig.rootSubfolder.startsWith('/');
      if (fixStartingSlash) {
        newConfig.rootSubfolder = newConfig.rootSubfolder.replace('/', '');
      }
      const fixRoot = !newConfig.subfolder.startsWith(newConfig.rootSubfolder);
      if (fixRoot) {
        newConfig.subfolder = newConfig.rootSubfolder;
      }
      newConfig.maxDepthReached = false; // when using portal root depth is infinite
    }
    if (!newConfig.usePortalRoot) {
      const currentDepth = newConfig.subfolder ? newConfig.subfolder.split('/').length : 0;
      const fixDepth = currentDepth >= newConfig.folderDepth;
      if (fixDepth) {
        let folders = newConfig.subfolder.split('/');
        folders = folders.slice(0, newConfig.folderDepth);
        newConfig.subfolder = folders.join('/');
        newConfig.maxDepthReached = true;
      } else {
        newConfig.maxDepthReached = false;
      }
    }
    this.adamConfig$.next(newConfig);

    // fix dropzone
    const oldDzConfig = this.config.dropzone.getConfig();
    const newDzConfig: Partial<DropzoneConfigExt> = {};
    const dzUrlParams = UrlHelper.getUrlParams(oldDzConfig.url as string);
    const dzSubfolder = dzUrlParams.subfolder || '';
    const dzUsePortalRoot = dzUrlParams.usePortalRoot;
    const fixUploadUrl = dzSubfolder !== newConfig.subfolder || dzUsePortalRoot !== newConfig.usePortalRoot.toString();
    if (fixUploadUrl) {
      let newUrl = oldDzConfig.url as string;
      newUrl = UrlHelper.replaceUrlParam(newUrl, 'subfolder', newConfig.subfolder);
      newUrl = UrlHelper.replaceUrlParam(newUrl, 'usePortalRoot', newConfig.usePortalRoot.toString());
      newDzConfig.url = newUrl;
    }
    const uploadDisabled = !newConfig.allowEdit
      || (
        (newConfig.subfolder === '' || newConfig.usePortalRoot && newConfig.subfolder === newConfig.rootSubfolder)
        && !newConfig.allowAssetsInRoot
      );
    const fixDisabled = oldDzConfig.disabled !== uploadDisabled;
    if (fixDisabled) {
      newDzConfig.disabled = uploadDisabled;
    }
    if (Object.keys(newDzConfig).length > 0) {
      this.config.dropzone.setConfig(newDzConfig);
    }
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          const expandedFieldId = this.route.snapshot.paramMap.get('expandedFieldId');
          if (expandedFieldId !== this.config.field.index.toString()) { return; }
          this.fetchItems();
        }
      })
    );
  }

}
