import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { BaseFieldComponent } from '../base/base-field.component';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerViewModel } from './picker.models';
import { PickerData } from './picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { EntityFieldDataSource } from './data-sources/entity-field-data-source';
import { FieldDataSourceFactoryService } from './factories/field-data-source-factory.service';
import { StringFieldDataSource } from './data-sources/string-field-data-source';
import { QueryFieldDataSource } from './data-sources/query-field-data-source';
import { PickerSourceAdapterFactoryService } from './factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from './factories/picker-state-adapter-factory.service';
import { PickerStringSourceAdapter } from './adapters/picker-string-source-adapter';
import { PickerEntitySourceAdapter } from './adapters/picker-entity-source-adapter';
import { PickerQuerySourceAdapter } from './adapters/picker-query-source-adapter';
import { PickerDataSourceEmpty } from './data-sources/picker-data-source-empty';
import { PickerStateAdapter } from './adapters/picker-state-adapter';
import { PickerEntityStateAdapter } from './adapters/picker-entity-state-adapter';
import { PickerStringStateAdapter } from './adapters/picker-string-state-adapter';

const logThis = false;

/**
 * These providers must be added to all the picker controls.
 * This is important, so that they get a new instance of the services.
 * Otherwise the end up sharing the same instance of the service.
 * ...and when opened the second time, they will show an empty dropdown.
 */
export const pickerProviders = [
  PickerSourceAdapterFactoryService,
  PickerStateAdapterFactoryService,
  FieldDataSourceFactoryService,
  StringFieldDataSource,
  EntityFieldDataSource,
  QueryFieldDataSource,
  PickerDataSourceEmpty,

  PickerStringSourceAdapter,
  PickerEntitySourceAdapter,
  PickerQuerySourceAdapter,

  PickerStateAdapter,
  PickerStringStateAdapter,
  PickerEntityStateAdapter,
];

@Component({
  // selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  providers: pickerProviders,
})
// @FieldMetadata({})
export class PickerComponent extends BaseFieldComponent<string | string[]> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  pickerData: PickerData;
  isStringQuery: boolean;
  isString: boolean;

  viewModel$: Observable<PickerViewModel>;

  protected log: EavLogger = new EavLogger('PickerComponent', logThis);

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    protected entityService: EntityService,
    public translate: TranslateService,
    public editRoutingService: EditRoutingService,
    public entityCacheService: EntityCacheService,
    public stringQueryCacheService: StringQueryCacheService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.refreshOnChildClosed();
  }

  /**
   * Initialize the Picker Adapter and View Model
   * If the PickerData already exists, it will be reused
   */
  initAdaptersAndViewModel(): void {
    // First, create the Picker Adapter or reuse
    // The reuse is a bit messy - reason is that there are two components (preview/dialog)
    // which have the same services, and if one is created first, the pickerData should be shared
    if (this.config.pickerData) {
      this.log.add('createPickerAdapters: pickerData already exists, will reuse');
      this.pickerData = this.config.pickerData;
    } else {
      // this method is overridden in each variant as of now
      this.createPickerAdapters();
      this.log.add('createPickerAdapters: config', this.config);
      this.config.pickerData = this.pickerData;
    }

    // Now create the View model
    this.createViewModel();
  }

  ngAfterViewInit(): void {
    this.pickerData.source.onAfterViewInit();
  }

  ngOnDestroy(): void {
    this.pickerData.destroy();

    super.ngOnDestroy();
  }

  /** Create the Picker Adapter - MUST be overridden in each inheriting class */
  protected createPickerAdapters(): void {
    throw new Error('Method not implemented. Must be overridden by inheriting class.');
  }

  createViewModel() {
    this.viewModel$ = combineLatest([this.pickerData.state.allowMultiValue$])
      .pipe(
        map(([allowMultiValue]) => {
          // allowMultiValue is used to determine if we even use control with preview and dialog
          const showPreview = !allowMultiValue || (allowMultiValue && this.controlConfig.isPreview)
          const viewModel: PickerViewModel = {
            showPreview,
          };
          return viewModel;
        }),
      );
  }

  focusOnSearchComponent(): void {
    this.entitySearchComponent.autocompleteRef?.nativeElement.focus();
  }

  private refreshOnChildClosed(): void {
    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    this.subscription.add(
      this.editRoutingService.childFormResult(this.config.index, this.config.entityGuid).subscribe(result => {
        // @2SDV TODO check why this triggers twice
        const newItemGuid = Object.keys(result)[0];
        if (!this.pickerData.state.createValueArray().includes(newItemGuid)) {
          this.pickerData.state.addSelected(newItemGuid);
          this.pickerData.source.forceReloadData([newItemGuid]);
        }
      })
    );
    // this is used when new entity is created/changed in child form it automatically fetched again
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        if (this.pickerData.source.editEntityGuid$.value)
          this.pickerData.source.forceReloadData([this.pickerData.source.editEntityGuid$.value]);
      })
    );
  }
}
