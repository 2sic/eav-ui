import { Component, Input, OnDestroy, OnInit, computed, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { EntityPickerPreviewViewModel } from './picker-preview.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { PickerData } from '../picker-data';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { PickerTextComponent } from '../picker-text/picker-text.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerTextToggleComponent } from '../picker-text-toggle/picker-text-toggle.component';
import { PickerPillsComponent } from '../picker-pills/picker-pills.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;

@Component({
  selector: 'app-picker-preview',
  templateUrl: './picker-preview.component.html',
  styleUrls: ['./picker-preview.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    PickerPillsComponent,
    PickerTextToggleComponent,
    PickerSearchComponent,
    PickerTextComponent,
    MatButtonModule,
    SharedComponentsModule,
    MatMenuModule,
    MatIconModule,
    FieldHelperTextComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class PickerPreviewComponent extends BaseComponent implements OnInit, OnDestroy, Field {
  pickerData = input.required<PickerData>()
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  viewModel$: Observable<EntityPickerPreviewViewModel>;

  isInFreeTextMode = computed(() => this.pickerData().state.isInFreeTextMode());

  log = new EavLogger('PickerPreviewComponent', logThis);

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
  ) {
    super();
  }

  ngOnInit(): void {
    const pickerData = this.pickerData();
    const state = pickerData.state;
    const selectedItems$ = pickerData.selectedItems$;
    const controlStatus$ = state.controlStatus$;
    const disableAddNew$ = state.disableAddNew$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableTextEntry: settings.EnableTextEntry,
        EnableCreate: settings.EnableCreate,
        CreateTypes: settings.CreateTypes,
      })),
      distinctUntilChanged(RxHelpers.objectsEqual),
    );

    this.viewModel$ = combineLatest([
      selectedItems$, settings$, controlStatus$, disableAddNew$
    ]).pipe(
      map(([
        selectedItems, settings, controlStatus, disableAddNew
      ]) => {
        const leavePlaceForButtons = (settings.CreateTypes && settings.EnableCreate) || settings.AllowMultiValue;
        const showAddNewEntityButton = settings.CreateTypes && settings.EnableCreate;
        const showGoToListDialogButton = settings.AllowMultiValue;
        const csDisabled = controlStatus.disabled;

        const viewModel: EntityPickerPreviewViewModel = {
          selectedItems,
          enableTextEntry: settings.EnableTextEntry,
          disableAddNew,

          leavePlaceForButtons,
          showAddNewEntityButton,
          showGoToListDialogButton,
          csDisabled,
        };

        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openNewEntityDialog(entityType: string): void {
    this.log.a(`openNewEntityDialog: '${entityType}'`);
    this.pickerData().source.editItem(null, entityType);
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  getEntityTypesData(): void {
    this.pickerData().state.getEntityTypesData();
  }
}
