import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { PickerSourceAdapter } from '../adapters/picker-source-adapter';
import { PickerStateAdapter } from '../adapters/picker-state-adapter';
import { EntityPickerPreviewTemplateVars } from './picker-preview.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { GeneralHelpers } from '../../../../shared/helpers';

@Component({
  selector: 'app-picker-preview',
  templateUrl: './picker-preview.component.html',
  styleUrls: ['./picker-preview.component.scss'],
})
export class PickerPreviewComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  templateVars$: Observable<EntityPickerPreviewTemplateVars>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
  ) {
    super();
  }

  ngOnInit(): void {
    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const selectedItems$ = this.pickerStateAdapter.selectedItems$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;
    const disableAddNew$ = this.pickerStateAdapter.disableAddNew$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableTextEntry: settings.EnableTextEntry,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.templateVars$ = combineLatest([
      selectedItems$, freeTextMode$, settings$, controlStatus$, disableAddNew$
    ]).pipe(
      map(([
        selectedItems, freeTextMode, settings, controlStatus, disableAddNew
      ]) => {
        const leavePlaceForButtons = (settings.EntityType && settings.EnableCreate) || settings.AllowMultiValue;
        const showAddNewEntityButton = settings.EntityType && settings.EnableCreate;
        const showGoToListDialogButton = settings.AllowMultiValue;

        const templateVars: EntityPickerPreviewTemplateVars = {
          selectedItems,
          freeTextMode,
          enableTextEntry: settings.EnableTextEntry,
          controlStatus,
          disableAddNew,

          leavePlaceForButtons,
          showAddNewEntityButton,
          showGoToListDialogButton,
        };

        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openNewEntityDialog(): void {
    this.pickerSourceAdapter.editEntity(null);
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}
