import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { BaseFieldComponent } from '../base/base-field.component';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerViewModel } from './picker.models';

@Component({
  // selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
})
// @FieldMetadata({})
export class PickerComponent extends BaseFieldComponent<string | string[]> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  pickerSourceAdapter: PickerSourceAdapter;
  pickerStateAdapter: PickerStateAdapter;
  isStringQuery: boolean;
  isString: boolean;
  isPreview: boolean;

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

    this.isPreview = this.controlConfig.isPreview;
    this.refreshOnChildClosed();
  }

  ngAfterViewInit(): void {
    this.pickerSourceAdapter.onAfterViewInit();
  }

  ngOnDestroy(): void {
    this.pickerSourceAdapter.destroy();
    this.pickerStateAdapter.destroy();

    super.ngOnDestroy();
  }

  createTemplateVariables() {
    this.viewModel$ = combineLatest([
      this.pickerStateAdapter.shouldPickerListBeShown$,
      this.pickerStateAdapter.allowMultiValue$,
      this.pickerStateAdapter.isDialog$,
      this.pickerStateAdapter.selectedEntities$.pipe(map(selectedEntities => selectedEntities.length), distinctUntilChanged()),
    ])
      .pipe(map(([shouldPickerListBeShown, allowMultiValue, isDialog, noSelectedEntities]) => {
        const viewModel: PickerViewModel = {
          shouldPickerListBeShown,
          allowMultiValue,
          isDialog,
          noSelectedEntities,
        };
        return viewModel;
      }),
    );
  }

  focusOnSearchComponent(): void {
    this.entitySearchComponent.autocompleteRef?.nativeElement.focus();
  }

  private refreshOnChildClosed(): void {
    // @2SDV TODO check what it does and add comments
    this.subscription.add(
      this.editRoutingService.childFormResult(this.config.index, this.config.entityGuid).subscribe(result => {
        const newItemGuid = Object.keys(result)[0];
        this.pickerStateAdapter.updateValue('add', newItemGuid);
      })
    );
    // @2SDV TODO check what it does and add comments
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.pickerSourceAdapter.fetchEntities(true);
      })
    );
  }
}
