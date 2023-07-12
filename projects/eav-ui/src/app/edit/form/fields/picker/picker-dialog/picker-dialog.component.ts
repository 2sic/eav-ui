import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
import { EntityPickerDialogTemplateVars } from './picker-dialog.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';

@Component({
  selector: 'app-picker-dialog',
  templateUrl: './picker-dialog.component.html',
  styleUrls: ['./picker-dialog.component.scss'],
})
export class PickerDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  templateVars$: Observable<EntityPickerDialogTemplateVars>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super();
  }

  ngOnInit(): void {
    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const disableAddNew$ = this.pickerStateAdapter.disableAddNew$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.templateVars$ = combineLatest([
      settings$, controlStatus$, freeTextMode$, disableAddNew$
    ]).pipe(
      map(([
        settings, controlStatus, freeTextMode, disableAddNew,
      ]) => {
        const showAddNewEntityButtonInDialog = !freeTextMode && settings.EnableCreate && settings.EntityType && settings.AllowMultiValue;

        const templateVars: EntityPickerDialogTemplateVars = {
          controlStatus,
          freeTextMode,
          disableAddNew,

          // additional properties for easier readability in the template
          showAddNewEntityButtonInDialog,
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
}
