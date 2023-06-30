import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldsSettingsService } from '../../../../shared/services';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
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
  ) {
    super();
   }

  ngOnInit(): void {
    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const selectedEntities$ = this.pickerStateAdapter.selectedEntities$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        EnableTextEntry: settings.EnableTextEntry,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.templateVars$ = combineLatest([
      selectedEntities$, freeTextMode$, settings$, controlStatus$
    ]).pipe(
      map(([
        selectedEntities, freeTextMode, settings, controlStatus
      ]) => {
        const templateVars: EntityPickerPreviewTemplateVars = {
          selectedEntities,
          freeTextMode,
          enableTextEntry: settings.EnableTextEntry,
          controlStatus,
        };

        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
