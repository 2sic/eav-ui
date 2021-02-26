import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { AdamConfig, AdamItem, DropzoneConfigExt } from '../../../../edit-types';
import { eavConstants } from '../../../../ng-dialogs/src/app/shared/constants/eav.constants';
import { EditForm } from '../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { FeaturesGuidsConstants } from '../../../../shared/features-guids.constants';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { UrlHelpers } from '../../../shared/helpers/url.helpers';
import { EavService } from '../../../shared/services/eav.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { FeatureService } from '../../../shared/store/ngrx-data/feature.service';
import { AdamService } from '../adam.service';
import { AdamBrowserTemplateVars, AdamConfigInstance } from './adam-browser.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-browser',
  templateUrl: './adam-browser.component.html',
  styleUrls: ['./adam-browser.component.scss'],
  animations: [
    trigger('adamShowAnimate', [
      state('closed', style({
        height: '0',
        overflow: 'hidden',
      })),
      state('open', style({
        height: '*',
        overflow: 'hidden',
      })),
      transition('closed => open', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),
  ]
})
export class AdamBrowserComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Output() openUpload = new EventEmitter<null>();

  templateVars$: Observable<AdamBrowserTemplateVars>;
  pasteClipboardImage: boolean;

  private adamConfig$: BehaviorSubject<AdamConfig>;
  private items$: BehaviorSubject<AdamItem[]>;
  private control: AbstractControl;
  private url: string;
  private subscription = new Subscription();

  constructor(
    private adamService: AdamService,
    private fileTypeService: FileTypeService,
    private featureService: FeatureService,
    private dnnContext: DnnContext,
    private eavService: EavService,
    private editRoutingService: EditRoutingService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];
    this.adamConfig$ = new BehaviorSubject<AdamConfig>(null);
    this.items$ = new BehaviorSubject<AdamItem[]>([]);
    this.refreshOnChildClosed();
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
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
    };
    this.subscription.add(
      this.adamConfig$.subscribe(adamConfig => {
        this.fetchItems();
      })
    );
    const expanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    const value$ = this.eavService.formValueChange$.pipe(
      filter(formSet => (formSet.formId === this.eavService.eavConfig.formId) && (formSet.entityGuid === this.config.entityGuid)),
      map(() => this.control.value),
      startWith(this.control.value),
      distinctUntilChanged(),
    );
    const disabled$ = this.eavService.formDisabledChange$.asObservable().pipe(
      filter(formSet => (formSet.formId === this.eavService.eavConfig.formId)
        && (formSet.entityGuid === this.config.entityGuid)
      ),
      map(() => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([this.adamConfig$, expanded$, this.items$, value$, disabled$]).pipe(
      map(([adamConfig, expanded, items, value, disabled]) => {
        const templateVars: AdamBrowserTemplateVars = {
          adamConfig,
          expanded,
          items,
          value,
          disabled,
        };
        return templateVars;
      }),
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

  editItemMetadata(adamItem: AdamItem) {
    const form: EditForm = {
      items: [
        adamItem.MetadataId === 0
          ? {
            ContentTypeName: adamItem._metadataContentType,
            For: {
              Target: eavConstants.metadata.cmsObject.target,
              String: `${adamItem.Type === 'folder' ? 'folder' : 'file'}:${adamItem.Id}`,
            }
          }
          : { EntityId: adamItem.MetadataId }
      ],
    };
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
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
    const newConfig: AdamConfig = { ...this.adamConfig$.value, ...{ usePortalRoot, showImagesOnly } };
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
    const startDisabled = this.config.isExternal;
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
    const dzUrlParams = UrlHelpers.getUrlParams(oldDzConfig.url as string);
    const dzSubfolder = dzUrlParams.subfolder || '';
    const dzUsePortalRoot = dzUrlParams.usePortalRoot;
    const fixUploadUrl = dzSubfolder !== newConfig.subfolder || dzUsePortalRoot !== newConfig.usePortalRoot.toString();
    if (fixUploadUrl) {
      let newUrl = oldDzConfig.url as string;
      newUrl = UrlHelpers.replaceUrlParam(newUrl, 'subfolder', newConfig.subfolder);
      newUrl = UrlHelpers.replaceUrlParam(newUrl, 'usePortalRoot', newConfig.usePortalRoot.toString());
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
      this.editRoutingService.childFormClosed().subscribe(result => {
        this.fetchItems();
      })
    );
  }

}
