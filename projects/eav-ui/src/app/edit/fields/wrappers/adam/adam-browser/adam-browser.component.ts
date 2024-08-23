import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, EventEmitter, inject, NgZone, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { AdamConfig, AdamItem } from '../../../../../../../../edit-types';
import { eavConstants } from '../../../../../shared/constants/eav.constants';
import { EditForm } from '../../../../../shared/models/edit-form.model';
import { FileTypeHelpers } from '../../../../shared/helpers';
import { AdamCacheService, LinkCacheService } from '../../../../shared/store/ngrx-data';
import { AdamConfigInstance } from './adam-browser.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material/badge';
import { PasteClipboardImageDirective } from '../../../directives/paste-clipboard-image.directive';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { ClickStopPropagationDirective } from '../../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import { BaseComponent } from '../../../../../shared/components/base.component';
import { FeaturesService } from '../../../../../shared/services/features.service';
import { FeatureNames } from '../../../../../features/feature-names';
import { EavLogger } from '../../../../../shared/logging/eav-logger';
import { mapUntilChanged } from '../../../../../shared/rxJs/mapUntilChanged';
import { openFeatureDialog } from '../../../../../features/shared/base-feature.component';
import { FieldState } from '../../../field-state';
import { FieldsSettingsService } from '../../../../state/fields-settings.service';
import { FormsStateService } from '../../../../state/forms-state.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { AdamService } from '../../../../shared/services/adam.service';
import { fixDropzone } from './dropzone-helper';

const logThis = false;
const nameOfThis = 'AdamBrowserComponent';

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
    ExtendedModule,
    MatIconModule,
    PasteClipboardImageDirective,
    MatBadgeModule,
    AsyncPipe,
    TranslateModule,
    ClickStopPropagationDirective,
    TippyDirective,
  ],
  // providers: [
  //   FeatureDetailService TODO:: is this in use???
  // ]
})
export class AdamBrowserComponent extends BaseComponent implements OnInit, OnDestroy {
  @Output() openUpload = new EventEmitter<null>();

  protected fieldState = inject(FieldState);

  protected config = this.fieldState.config;
  protected group = this.fieldState.group;

  viewModel$: Observable<AdamBrowserViewModel>;

  private adamConfig$: BehaviorSubject<AdamConfig>;
  private items$: BehaviorSubject<AdamItem[]>;
  private control: AbstractControl;
  private url: string;
  private firstFetch = true;

  public features: FeaturesService = inject(FeaturesService);
  public isPasteImageFromClipboardEnabled = this.features.isEnabled(FeatureNames.PasteImageFromClipboard);

  protected expanded = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid)

  constructor(
    private adamService: AdamService,
    private dnnContext: DnnContext,
    private editRoutingService: EditRoutingService,
    private zone: NgZone,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formsStateService: FormsStateService,
    private fieldsSettingsService: FieldsSettingsService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];


    this.adamConfig$ = new BehaviorSubject<AdamConfig>(null);
    this.items$ = new BehaviorSubject<AdamItem[]>([]);

    // Update data if a child-form closes
    this.subscriptions.add(
      this.editRoutingService.childFormClosed().subscribe(() => this.fetchItems())
    );

    const contentType = this.config.contentTypeNameId;
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
        this.log.a('setConfig', config);
        const newConfig = AdamConfigInstance.completeConfig(config, this.config, this.adamConfig$.value);
        this.zone.run(() => {
          this.adamConfig$.next(newConfig);
          fixDropzone(newConfig, this.config);
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
    this.subscriptions.add(
      this.adamConfig$.subscribe(() => {
        this.fetchItems();
      })
    );


    const value$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      mapUntilChanged(m => m),
      // distinctUntilChanged(),
    );
    const disabled$ = this.control.valueChanges.pipe(
      map(() => this.control.disabled),
      startWith(this.control.disabled),
      mapUntilChanged(m => m),
      // distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([this.adamConfig$, this.items$, value$, disabled$]).pipe(
      map(([adamConfig, items, value, disabled]) => {
        const viewModel: AdamBrowserViewModel = {
          adamConfig,
          items,
          value,
          disabled,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    this.adamConfig$.complete();
    this.items$.complete();
    super.ngOnDestroy();
  }

  addFolder() {
    if (this.control.disabled) return;

    const folderName = window.prompt('Please enter a folder name'); // todo i18n
    if (!folderName) return;

    this.adamService.addFolder(folderName, this.url, this.adamConfig$.value).subscribe(res => {
      this.fetchItems();
    });
  }

  del(item: AdamItem) {
    if (this.control.disabled) return;

    const ok = window.confirm('Are you sure you want to delete this item?'); // todo i18n
    if (!ok) return;

    this.adamService.deleteItem(item, this.url, this.adamConfig$.value).subscribe(res => {
      this.fetchItems();
    });
  }

  editItemMetadata(adamItem: AdamItem, contentTypeName: string, metadataId: number) {
    if (this.formsStateService.readOnly().isReadOnly || !contentTypeName) return;

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
    if (this.control.disabled) return;

    const newName = window.prompt('Rename the file / folder to: ', item.Name); // todo i18n
    if (!newName) return;

    this.adamService.rename(item, newName, this.url, this.adamConfig$.value).subscribe(res => {
      this.fetchItems();
    });
  }

  select(item: AdamItem) {
    if (this.control.disabled || !this.adamConfig$.value.enableSelect) return;
    this.config.adam.onItemClick(item);
  }

  private fetchItems() {
    const adamConfig = this.adamConfig$.value;
    if (adamConfig == null) return;
    if (!adamConfig.autoLoad) return;

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
      // console.log('2dm for 2reserve', items);
      this.processFetchedItems(items, adamConfig);
    });
  }

  openFeatureInfoDialog() {
    if (!this.isPasteImageFromClipboardEnabled)
      openFeatureDialog(this.dialog, FeatureNames.PasteImageFromClipboard, this.viewContainerRef, this.changeDetectorRef);
  }

  private processFetchedItems(items: AdamItem[], adamConfig: AdamConfig): void {
    this.linkCacheService.loadAdam(items);

    const filteredItems: AdamItem[] = [];
    const extensionsFilter = getExtensionsFilter(adamConfig.fileFilter);

    for (const item of items) {
      if (item.Name === '.') { // is root
        const allowEdit = item.AllowEdit;
        if (allowEdit !== adamConfig.allowEdit)
          this.config.adam.setConfig({ allowEdit });
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
    if (JSON.stringify(newConfig) === JSON.stringify(this.adamConfig$.value))
      newConfig.autoLoad = !newConfig.autoLoad;
    else if (!newConfig.autoLoad)
      newConfig.autoLoad = true;

    this.config.adam.setConfig(newConfig);
  }

  trackByFn(index: number, item: AdamItem) {
    return item.Id;
  }

}

function getExtensionsFilter(fileFilter: string) {
  if (!fileFilter) return [];

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

export interface AdamBrowserViewModel {
  adamConfig: AdamConfig;
  items: AdamItem[];
  value: string;
  disabled: boolean;
}