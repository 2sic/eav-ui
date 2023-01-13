import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, startWith, Subscription } from 'rxjs';
import { AdamConfig, AdamItem, DropzoneConfigExt } from '../../../../../../../../edit-types';
import { eavConstants } from '../../../../../shared/constants/eav.constants';
import { EditForm } from '../../../../../shared/models/edit-form.model';
import { FileTypeHelpers, UrlHelpers } from '../../../../shared/helpers';
import { AdamService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../../shared/services';
import { AdamCacheService, LinkCacheService } from '../../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
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

  private adamConfig$: BehaviorSubject<AdamConfig>;
  private items$: BehaviorSubject<AdamItem[]>;
  private control: AbstractControl;
  private url: string;
  private subscription = new Subscription();
  private firstFetch = true;

  constructor(
    private adamService: AdamService,
    private featuresService: FeaturesService,
    private dnnContext: DnnContext,
    private editRoutingService: EditRoutingService,
    private zone: NgZone,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formsStateService: FormsStateService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];
    this.adamConfig$ = new BehaviorSubject<AdamConfig>(null);
    this.items$ = new BehaviorSubject<AdamItem[]>([]);
    this.refreshOnChildClosed();
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.url = this.dnnContext.$2sxc.http.apiUrl(`app/auto/data/${contentType}/${entityGuid}/${field}`);

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
      this.adamConfig$.subscribe(() => {
        this.fetchItems();
      })
    );
    const allowPasteImageFromClipboard$ = this.featuresService.isEnabled$(FeatureNames.PasteImageFromClipboard).pipe(
      distinctUntilChanged(),
    );
    const expanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    const value$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      distinctUntilChanged(),
    );
    const disabled$ = this.control.valueChanges.pipe(
      map(() => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([this.adamConfig$, expanded$, this.items$, value$, disabled$, allowPasteImageFromClipboard$]).pipe(
      map(([adamConfig, expanded, items, value, disabled, allowPasteImageFromClipboard]) => {
        const templateVars: AdamBrowserTemplateVars = {
          adamConfig,
          expanded,
          items,
          value,
          disabled,
          allowPasteImageFromClipboard
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

  editItemMetadata(adamItem: AdamItem, contentTypeName: string, metadataId: number) {
    if (this.formsStateService.readOnly$.value.isReadOnly || !contentTypeName) { return; }

    const form: EditForm = {
      items: [
        metadataId > 0
          ? { EntityId: metadataId }
          : {
            ContentTypeName: contentTypeName,
            For: {
              Target: eavConstants.metadata.cmsObject.target,
              TargetType: eavConstants.metadata.cmsObject.targetType,
              String: adamItem.ReferenceId,
            },
          },
      ],
    };
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  goUp() {
    let subfolder = this.adamConfig$.value.subfolder;
    subfolder = subfolder.includes('/') ? subfolder.slice(0, subfolder.lastIndexOf('/')) : '';
    this.config.adam.setConfig({ subfolder });
  }

  private getImageConfigurationContentType(item: AdamItem) {
    // allow image configuration if file is type image and if image configuration is enabled in settings
    const settings = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
    return settings.EnableImageConfiguration && item.Type === 'image'
      ? eavConstants.contentTypes.imageDecorator
      : null;
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

    const newName = window.prompt('Rename the file / folder to: ', item.Name); // todo i18n
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

    if (this.firstFetch) {
      this.firstFetch = false;
      const adamItems = this.adamCacheService.getAdamSnapshot(this.config.entityGuid, this.config.fieldName);
      if (adamItems) {
        const clonedItems = adamItems.map(adamItem => {
          const clone: AdamItem = { ...adamItem };
          return clone;
        });
        setTimeout(() => { this.processFetchedItems(clonedItems, adamConfig); });
        return;
      }
    }

    this.adamService.getAll(this.url, adamConfig).subscribe(items => {
      this.processFetchedItems(items, adamConfig);
    });
  }

  private processFetchedItems(items: AdamItem[], adamConfig: AdamConfig): void {
    this.linkCacheService.loadAdam(items);

    const filteredItems: AdamItem[] = [];
    const extensionsFilter = this.getExtensionsFilter(adamConfig.fileFilter);

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
      if (extensionsFilter.length > 0) {
        const extension = item.Name.substring(item.Name.lastIndexOf('.') + 1).toLocaleLowerCase();
        if (!extensionsFilter.includes(extension)) { continue; }
      }

      item._imageConfigurationContentType = this.getImageConfigurationContentType(item);
      item._imageConfigurationId = item.Metadata?.find(m => m.Type.Name === item._imageConfigurationContentType)?.Id ?? 0;
      item._metadataContentType = this.getMetadataContentType(item);
      item._metadataId = item.Metadata?.find(m => m.Type.Name === item._metadataContentType)?.Id ?? 0;
      item._icon = FileTypeHelpers.getIconClass(item.Name);
      item._isMaterialIcon = FileTypeHelpers.isKnownType(item.Name);
      item._displaySize = (item.Size / 1024).toFixed(0);
      filteredItems.push(item);
    }

    filteredItems.sort((a, b) => a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase()));
    filteredItems.sort((a, b) => b.IsFolder.toString().localeCompare(a.IsFolder.toString()));
    this.items$.next(filteredItems);
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

    for (const key of Object.keys(newConfig)) {
      (newConfig as any)[key] = (config as any)[key] ?? (oldConfig as any)[key];
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

  private getExtensionsFilter(fileFilter: string) {
    if (!fileFilter) { return []; }

    const extensions = fileFilter.split(',').map(extension => {
      extension = extension.trim();

      if (extension.startsWith('*.')) {
        extension = extension.replace('*.', '');
      } else if (extension.startsWith('*')) {
        extension = extension.replace('*', '');
      }

      return extension.toLocaleLowerCase();
    });
    return extensions;
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchItems();
      })
    );
  }

}
