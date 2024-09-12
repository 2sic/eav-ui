import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ServiceBase } from '../../../shared/services/service-base';
import { FieldValueHelpers } from '../../shared/helpers/field-value.helpers';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { classLog } from '../../../shared/logging';
import { FieldInitSpecs } from './field-init-specs.model';
import { UiControl } from '../../shared/controls/control-status.model';

@Injectable()
export class FormFieldsSyncService extends ServiceBase {

  log = classLog({FormFieldsSyncService}, null);

  constructor() {
    super();
  }

  keepFieldsAndStateInSync(form: UntypedFormGroup, fieldsToProcess: Observable<FieldInitSpecs[]>) {
    const l = this.log.fn('keepFieldsAndStateInSync');
    // This has multiple features, possibly we should separate them
    // 2. Sync values between form and fieldProps - eg. on value changes which are from formulas
    // 3. Ensure disabled state is in sync eg. after settings recalculations
    // 4. Ensure validators are run in such scenarios
    this.subscriptions.add(
      fieldsToProcess.subscribe(allFields => {
        // Figure out which fields may require further processing
        const fieldsOnForm = allFields.filter(set => set.hasControl);

        // 2. sync values - create list comparing the old raw values and new fieldProps - eg. modified by formulas
        this.log.a(`sync values for max ${fieldsOnForm.length} controls`);
        const oldValues: ItemValuesOfLanguage = form.getRawValue();
        const newValues: ItemValuesOfLanguage = {};
        for (const { name: fieldName, value } of fieldsOnForm)
          newValues[fieldName] = value;

        const changes = FieldValueHelpers.getItemValuesChanges(oldValues, newValues);
        if (changes != null) {
          this.log.a(`patching form as it changed (${Object.keys(changes).length}`, { changes, oldValues, newValues })
          // controls probably don't need to set touched and dirty for this kind of update.
          // This update usually happens for language change, formula or updates on same entity in another Edit Ui.
          // In case controls should be updated, update with control.markAsTouched and control.markAsDirty.
          // Marking the form will not mark controls, but marking controls marks the form
          form.patchValue(changes);
        } else
          this.log.a('no changes detected', { oldValues, newValues });

        // 3. sync disabled if state not matching
        this.log.a('sync "disabled" state');
        for (const { control, props: fieldProps } of fieldsOnForm) {
          // WARNING!!! Fires valueChange event for every single control
          UiControl.disable(control, fieldProps.settings.uiDisabled);
        }

        // 4. run validators - required because formulas can recalculate validators and if value doesn't change, new validator will not run
        this.log.a('run validators');
        for (const { control } of fieldsOnForm)
          control.updateValueAndValidity();
      })
    );

    l.end();
  }
}
