import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { combineLatest, map, Observable } from 'rxjs';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../base/base-field.component';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerViewModel } from './picker.models';
import { PickerAdapterBase } from './picker-adapter-base';

@Component({
  selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
})
@FieldMetadata({})
export class PickerComponent extends BaseFieldComponent<string | string[]> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  pickerSourceAdapter: PickerSourceAdapter;// = new PickerSourceAdapter();
  pickerStateAdapter: PickerStateAdapter;// = new PickerStateAdapter();
  pickerAdapterBase: PickerAdapterBase;// = new PickerAdapterBase();

  isQuery: boolean;
  isStringQuery: boolean;

  viewModel$: Observable<PickerViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    protected entityService: EntityService,
    public translate: TranslateService,
    protected editRoutingService: EditRoutingService,
    public entityCacheService: EntityCacheService,
    public stringQueryCacheService: StringQueryCacheService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.refreshOnChildClosed();
  }

  ngAfterViewInit(): void {
    this.pickerSourceAdapter.fixPrefillAndStringQueryCache();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  createTemplateVariables() {
    this.viewModel$ = combineLatest([this.pickerStateAdapter.shouldPickerListBeShown$])
      .pipe(map(([shouldPickerListBeShown]) => {
        const viewModel: PickerViewModel = {
          shouldPickerListBeShown,
        };
        return viewModel;
      }),
    );
  }

  /**
   * WARNING! Overridden in subclass.
   * @param clearAvailableEntitiesAndOnlyUpdateCache - clears availableEntities and fetches only items which are selected
   * to update names in entityCache
   */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void { }

  private refreshOnChildClosed(): void {
    this.subscription.add(
      this.editRoutingService.childFormResult(this.config.index, this.config.entityGuid).subscribe(result => {
        const newItemGuid = Object.keys(result)[0];
        this.pickerStateAdapter.updateValue('add', newItemGuid);
      })
    );
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchEntities(true);
      })
    );
  }
}
