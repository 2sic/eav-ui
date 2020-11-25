import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { BuildFieldsService } from '../../../eav-item-dialog/item-edit-form/build-fields.service';
import { FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { FieldConfigGroup, FieldConfigSet } from '../../model/field-config';
import { FormValueChange } from './eav-form.models';

@Component({
  selector: 'app-eav-form',
  templateUrl: './eav-form.component.html',
  styleUrls: ['./eav-form.component.scss'],
  providers: [FormulaInstanceService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EavFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() rootConfig: FieldConfigSet;
  @Input() fieldConfigs: FieldConfigSet[];
  @Input() private formId: number;
  @Input() private entityGuid: string;
  @Output() private formSubmit = new EventEmitter<void>();
  @Output() private formValueChange = new EventEmitter<FormValueChange>();

  form: FormGroup = new FormGroup({});
  private subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private formulaInstance: FormulaInstanceService,
    private languageInstanceService: LanguageInstanceService,
    private fieldsSettingsService: FieldsSettingsService,
    private buildFieldsService: BuildFieldsService,
  ) { }

  ngOnInit() {
    this.createControlsInFormGroup(this.fieldConfigs);
    this.formulaInstance.init(this.formId, this.form, this.entityGuid, this.fieldConfigs);
  }

  ngAfterViewInit() {
    this.buildFieldsService.startTranslations(this.fieldConfigs, this.form, this.formulaInstance, this.fieldsSettingsService);

    // run formulas when form is created
    this.formulaInstance.runSettingsFormulas();
    this.formulaInstance.runValueFormulas();

    this.subscription.add(
      this.form.valueChanges.subscribe((formValues: FormValues) => {
        this.formValueChange.emit({ formValues, formulaInstance: this.formulaInstance });
      })
    );

    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.formId).pipe(skip(1)).subscribe(currentLang => {
        // run formulas when language is changed and fields are translated
        this.formulaInstance.runFormulasAfterFieldsTranslated();
      })
    );
  }

  ngOnDestroy() {
    this.buildFieldsService.stopTranslations(this.fieldConfigs);
    this.subscription.unsubscribe();
  }

  submitOutside() {
    angularConsoleLog('form save');
    // Use this to emit value out
    this.formSubmit.emit();
  }

  /**
   * Patch values to formGroup. It accepts an object with control names as keys and will do it's best to
   * match the values to the correct controls in the group.
   * If emitEvent is true, this change will cause a valueChanges event on the FormGroup to be emitted.
   * This defaults to true (as it falls through to updateValueAndValidity)
   */
  patchValue(values: { [key: string]: any }, emitEvent: boolean) {
    this.form.patchValue(values, { emitEvent });
  }

  /** Check if value in form changed */
  valueIsChanged(values: { [key: string]: any }) {
    let valueIsChanged = false;

    const valueKeys = Object.keys(values);
    for (const valueKey of valueKeys) {
      if (values[valueKey] !== this.form.value[valueKey]) {
        valueIsChanged = true;
        break;
      }
    }

    // spm isn't this always true? Something could be wrong here
    angularConsoleLog('VALUECHANGED:', valueIsChanged, 'VALUES:', values, 'FORM VALUES:', this.form.value);
    return valueIsChanged;
  }

  /** Create form from configuration */
  private createControlsInFormGroup(fieldConfigs: FieldConfigSet[]) {
    try {
      fieldConfigs.forEach(fieldConfig => {
        const field = fieldConfig.field as FieldConfigGroup;
        if (field.fieldGroup) {
          this.createControlsInFormGroup(field.fieldGroup);
        } else {
          this.form.addControl(fieldConfig.field.name, this.createControl(fieldConfig));
        }
      });
      return this.form;
    } catch (error) {
      console.error(`Error creating form controls: ${error}\nFieldConfig: ${fieldConfigs}`);
      throw error;
    }
  }

  /** Create form control */
  private createControl(fieldConfig: FieldConfigSet) {
    try {
      const { disabled, validation, initialValue } = fieldConfig.field;
      return this.formBuilder.control({ disabled, value: initialValue }, validation);
    } catch (error) {
      console.error(`Error creating form control: ${error}\nConfig: ${fieldConfig}`);
      throw error;
    }
  }
}
