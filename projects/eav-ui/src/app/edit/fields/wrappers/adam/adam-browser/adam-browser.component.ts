import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, effect, EventEmitter, inject, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import isEqual from 'lodash-es/isEqual';
import { transient } from '../../../../../../../../core/transient';
import { AdamConfig } from '../../../../../../../../edit-types/src/AdamConfig';
import { AdamItem } from '../../../../../../../../edit-types/src/AdamItem';
import { FeatureNames } from '../../../../../features/feature-names';
import { FeaturesScopedService } from '../../../../../features/features-scoped.service';
import { openFeatureDialog } from '../../../../../features/shared/base-feature.component';
import { eavConstants } from '../../../../../shared/constants/eav.constants';
import { ClickStopPropagationDirective } from '../../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import { classLog } from '../../../../../shared/logging';
import { EditForm, EditPrep } from '../../../../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../../../../shared/routing/dialog-routing.service';
import { computedObj, signalObj } from '../../../../../shared/signals/signal.utilities';
import { FormsStateService } from '../../../../form/forms-state.service';
import { EditRoutingService } from '../../../../routing/edit-routing.service';
import { AdamCacheService } from '../../../../shared/adam/adam-cache.service';
import { AdamService } from '../../../../shared/adam/adam.service';
import { LinkCacheService } from '../../../../shared/adam/link-cache.service';
import { FileTypeHelpers } from '../../../../shared/helpers';
import { PasteClipboardImageDirective } from '../../../directives/paste-clipboard-image.directive';
import { FieldState } from '../../../field-state';
import { AdamConfigInstance } from './adam-browser.models';
import { AdamConnector } from './adam-connector';
import { fixDropzone } from './dropzone-helper';

const logSpecs = {
  all: false,
  constructor: false,
  editItemMetadata: false,
  setConfig: false,
  fetchItems: true,
  processFetchedItems: true,
}

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
  ],
  standalone: true,
  imports: [
    NgClass,
    MatIconModule,
    PasteClipboardImageDirective,
    MatBadgeModule,
    AsyncPipe,
    TranslateModule,
    ClickStopPropagationDirective,
    TippyDirective,
  ],
})
export class AdamBrowserComponent implements OnInit {

  @Output() openUpload = new EventEmitter<null>();

  log = classLog({ AdamBrowserComponent }, logSpecs);

  protected fieldState = inject(FieldState);
  #editRoutingService = inject(EditRoutingService);
  #features = inject(FeaturesScopedService);

  #adamService = transient(AdamService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private dnnContext: DnnContext,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formsStateService: FormsStateService,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const l = this.log.fnIf('constructor');
    // Ensure that we fetch items when we have the configuration
    effect(() => {
      const adamConfig = this.adamConfig();
      if (adamConfig == null) return;
      this.fetchItems();
    });

    const cnf = this.config;
    this.#url = this.dnnContext.$2sxc.http.apiUrl(`app/auto/data/${cnf.contentTypeNameId}/${cnf.entityGuid}/${cnf.fieldName}`);
  }

  protected config = this.fieldState.config;
  protected group = this.fieldState.group;
  #ui = this.fieldState.ui;

  protected disabled = computedObj('disabled', () => this.#ui().disabled);

  protected value = computedObj('value', () => this.fieldState.uiValue());

  public adamConfig = signalObj<AdamConfig>('adamConfig', null); // here the change detection is critical
  public items = signalObj<AdamItem[]>('items', []);

  #url: string;
  #firstFetch = true;

  allowAddButtons = computedObj('allowAddButtons', () => {
    const cnf = this.adamConfig();
    return cnf.allowEdit && !((cnf.subfolder === '' || cnf.usePortalRoot && cnf.subfolder === cnf.rootSubfolder) && !cnf.allowAssetsInRoot)
  });

  protected isPasteImageFromClipboardEnabled = this.#features.isEnabled[FeatureNames.PasteImageFromClipboard];

  ngOnInit() {
    // Update data if a child-form closes
    this.#dialogRouter.doOnDialogClosed(() => this.fetchItems());

    // Attach this browser to the AdamConnector
    (this.config.adam as AdamConnector).setBrowser(this);
  }

  addFolder() {
    if (this.#ui().disabled) return;

    const folderName = window.prompt('Please enter a folder name'); // todo i18n
    if (!folderName) return;

    this.#adamService.addFolder(folderName, this.#url, this.adamConfig())
      .subscribe(() => this.fetchItems());
  }

  del(item: AdamItem) {
    if (this.#ui().disabled) return;

    const ok = window.confirm('Are you sure you want to delete this item?'); // todo i18n
    if (!ok) return;

    this.#adamService.deleteItem(item, this.#url, this.adamConfig())
      .subscribe(() => this.fetchItems());
  }

  editItemMetadata(adamItem: AdamItem, contentTypeName: string, metadataId: number) {
    const l = this.log.fnIf('editItemMetadata', {adamItem, contentTypeName, metadataId});
    if (this.formsStateService.readOnly().isReadOnly || !contentTypeName)
      return l.end('readonly or no content type');

    const form: EditForm = {
      items: [
        metadataId > 0
          ? EditPrep.editId(metadataId)
          : EditPrep.newMetadata(adamItem.ReferenceId, contentTypeName, eavConstants.metadata.cmsObject),
      ],
    };
    this.#editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  goUp() {
    let subfolder = this.adamConfig().subfolder;
    subfolder = subfolder.includes('/') ? subfolder.slice(0, subfolder.lastIndexOf('/')) : '';
    this.setConfig({ subfolder });
  }

  #getImageConfigurationContentType(item: AdamItem) {
    // allow image configuration if file is type image and if image configuration is enabled in settings
    const settings = this.fieldState.settings();
    return settings.EnableImageConfiguration && item.Type === 'image'
      ? eavConstants.contentTypes.imageDecorator
      : null;
  }

  #getMetadataContentType(item: AdamItem) {
    let found: string[];

    // check if it's a folder and if this has a special registration
    if (item.Type === 'folder') {
      found = this.adamConfig().metadataContentTypes.match(/^(folder)(:)([^\n]*)/im);
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
    found = this.adamConfig().metadataContentTypes.match(/^([^:\n]*)(\n|$)/im);
    if (found) { return found[1]; }

    // this is if we don't find anything
    return null;
  }

  goIntoFolder(item: AdamItem) {
    let subfolder = this.adamConfig().subfolder;
    subfolder = subfolder ? `${subfolder}/${item.Name}` : item.Name;
    this.setConfig({ subfolder });
  }

  openUploadClick(event: MouseEvent) {
    this.openUpload.emit();
  }

  rename(item: AdamItem) {
    if (this.#ui().disabled) return;

    const newName = window.prompt('Rename the file / folder to: ', item.Name); // todo i18n
    if (!newName) return;

    this.#adamService.rename(item, newName, this.#url, this.adamConfig())
      .subscribe(() => this.fetchItems());
  }

  select(item: AdamItem) {
    if (this.#ui().disabled || !this.adamConfig().enableSelect) return;
    this.config.adam.onItemClick(item);
  }

  /**
   * Note: since all fetch-items happen in a timeout or subscribe, it doesn't need to be in the NgZone
   * @returns
   */
  public fetchItems() {
    const adamConfig = this.adamConfig();
    const l = this.log.fnIf('fetchItems', { adamConfig, firstFetch: this.#firstFetch, usePortalRoot: adamConfig?.usePortalRoot });
    if (adamConfig == null) return;
    if (!adamConfig.autoLoad) return;

    if (this.#firstFetch) {
      this.#firstFetch = false;
      const adamItems = this.adamCacheService.getAdamSnapshot(this.config.entityGuid, this.config.fieldName);
      if (adamItems) {
        const clonedItems = adamItems.map(adamItem => ({ ...adamItem } satisfies AdamItem));
        setTimeout(() => this.#processFetchedItems(clonedItems, adamConfig));
        return;
      }
    }

    this.#adamService.getAll(this.#url, adamConfig)
      .subscribe(items => this.#processFetchedItems(items, adamConfig));
  }

  openFeatureInfoDialog() {
    if (!this.isPasteImageFromClipboardEnabled())
      openFeatureDialog(this.matDialog, FeatureNames.PasteImageFromClipboard, this.viewContainerRef, this.changeDetectorRef);
  }

  #processFetchedItems(items: AdamItem[], adamConfig: AdamConfig): void {
    const l = this.log.fnIf('processFetchedItems', { items, adamConfig, usePortalRoot: adamConfig.usePortalRoot });
    this.linkCacheService.addAdam(items);

    const filteredItems: AdamItem[] = [];
    const extensionsFilter = getExtensionsFilter(adamConfig.fileFilter);

    for (const item of items) {
      if (item.Name === '.') { // is root
        const allowEdit = item.AllowEdit;
        if (allowEdit !== adamConfig.allowEdit)
          this.setConfig({ allowEdit });
        continue;
      }
      if (item.Name === '2sxc' || item.Name === 'adam')
        continue;
      if (!item.IsFolder && adamConfig.showImagesOnly && item.Type !== 'image')
        continue;
      if (item.IsFolder && adamConfig.maxDepthReached)
        continue;
      if (extensionsFilter.length > 0) {
        const extension = item.Name.substring(item.Name.lastIndexOf('.') + 1).toLocaleLowerCase();
        if (!extensionsFilter.includes(extension)) continue;
      }

      item._imageConfigurationContentType = this.#getImageConfigurationContentType(item);
      item._imageConfigurationId = item.Metadata?.find(m => m.Type.Name === item._imageConfigurationContentType)?.Id ?? 0;
      item._metadataContentType = this.#getMetadataContentType(item);
      item._metadataId = item.Metadata?.find(m => m.Type.Name === item._metadataContentType)?.Id ?? 0;
      item._icon = FileTypeHelpers.getIconClass(item.Name);
      item._isMaterialIcon = FileTypeHelpers.isKnownType(item.Name);
      item._displaySize = (item.Size / 1024).toFixed(0);
      filteredItems.push(item);
    }

    filteredItems.sort((a, b) => a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase()));
    filteredItems.sort((a, b) => b.IsFolder.toString().localeCompare(a.IsFolder.toString()));
    this.items.set(filteredItems);
  }

  public setConfig(config: Partial<AdamConfig>) {
    const l = this.log.fnIf('setConfig', config);
    const newConfig = AdamConfigInstance.completeConfig(config, this.config, this.adamConfig());

    // There is a high risk of infinite loops here, so we need to ensure that we don't do this too often
    if (isEqual(newConfig, this.adamConfig())) {
      l.end('no change');
      return;
    }

    this.adamConfig.set(newConfig);
    fixDropzone(newConfig, this.config);
    l.end();
  }


  public toggle(usePortalRoot: boolean, showImagesOnly: boolean) {
    const newConfig: AdamConfig = { ...this.adamConfig(), ...{ usePortalRoot, showImagesOnly } };

    if (isEqual(newConfig, this.adamConfig()))
      newConfig.autoLoad = !newConfig.autoLoad;
    else if (!newConfig.autoLoad)
      newConfig.autoLoad = true;

    this.setConfig(newConfig);
  }
}

function getExtensionsFilter(fileFilter: string) {
  if (!fileFilter) return [];

  const extensions = fileFilter.split(',').map(extension => {
    extension = extension.trim();

    if (extension.startsWith('*.'))
      extension = extension.replace('*.', '');
    else if (extension.startsWith('*'))
      extension = extension.replace('*', '');

    return extension.toLocaleLowerCase();
  });

  return extensions;
}

