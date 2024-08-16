import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, startWith } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FormulaEngine } from '../../../formulas/formula-engine';
import { ValidationHelpers } from '../../../shared/helpers';
import { FormValues, SxcAbstractControl } from '../../../shared/models';
import { FormConfigService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../shared/services';
import { AdamCacheService, ItemService } from '../../../shared/store/ngrx-data';
import { FormulaPromiseHandler } from '../../../formulas/formula-promise-handler';
import { FormItemFormulaService } from '../../../formulas/form-item-formula.service';
import { EmptyFieldHelpers } from '../../fields/empty/empty-field-helpers';
import { FieldLogicWithValueInit } from '../../shared/field-logic/field-logic-with-init';
import { FieldLogicManager } from '../../shared/field-logic/field-logic-manager';
import { EntityWrapperComponent } from '../entity-wrapper/entity-wrapper.component';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { EntityFormStateService } from '../../entity-form-state.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { mapUntilChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';

const logThis = false;
const nameOfThis = 'FormBuilderComponent';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EntityWrapperComponent,
  ],
  providers: [
    FieldsSettingsService,  // used for Edit Dialog Main
    FieldsTranslateService, // used for Edit Dialog Header
    FormItemFormulaService, // used in Dialog entry and Dialog Header Dialog Main
    FormulaEngine, // used in Dialog entry and Dialog Header Dialog Main
    FormulaPromiseHandler, // used in Dialog entry and Dialog Header Dialog Main

    // new
    EntityFormStateService,
  ],
})
export class FormBuilderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  form = new UntypedFormGroup({});

  /** Inject the form state service, but automatically add the form for later use */
  #formStateService = inject(EntityFormStateService).setup(this.form);

  constructor(
    public fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
    private formBuilder: UntypedFormBuilder,
    private formConfig: FormConfigService,
    private formsStateService: FormsStateService,
    private itemService: ItemService,
    private adamCacheService: AdamCacheService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnInit() {
    this.fieldsSettingsService.init(this.entityGuid);
    this.fieldsTranslateService.init(this.entityGuid);

    const form = this.form;

    this.subscriptions.add(
      this.fieldsSettingsService.getFieldsProps$().subscribe(fieldsProps => {
        // 1. create missing controls - usually just on first cycle
        this.log.a('create missing controls');
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          const inputType = fieldProps.calculatedInputType.inputType;

          if (EmptyFieldHelpers.isEmptyInputType(inputType))
            continue;

          if (form.controls.hasOwnProperty(fieldName))
            continue;

          // Special treatment for wysiwyg fields
          if (inputType === InputTypeConstants.StringWysiwyg && fieldProps.value) {
            const logic = FieldLogicManager.singleton().get(InputTypeConstants.StringWysiwyg);
            const adamItems = this.adamCacheService.getAdamSnapshot(this.entityGuid, fieldName);
            fieldProps.value = (logic as unknown as FieldLogicWithValueInit).processValueOnLoad(fieldProps.value, adamItems);
          }

          const value = fieldProps.value;
          const disabled = fieldProps.settings.Disabled || fieldProps.settings.ForcedDisabled;
          const validators = ValidationHelpers.getValidators(fieldName, inputType, this.fieldsSettingsService);
          const newControl = this.formBuilder.control({ disabled, value }, validators);
          // TODO: build all fields at once. That should be faster
          form.addControl(fieldName, newControl);
          ValidationHelpers.ensureWarning(form.controls[fieldName]);
        }

        // 2. sync values - create list comparing the old raw values and new fieldProps
        this.log.a('sync values');
        const oldValues: FormValues = form.getRawValue();
        const newValues: FormValues = {};
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!form.controls.hasOwnProperty(fieldName)) continue;
          newValues[fieldName] = fieldProps.value;
        }

        const changes = ControlHelpers.getFormChanges(oldValues, newValues);
        if (changes != null) {
          this.log.a('patching form as it changed', { changes, oldValues, newValues })
          // controls probably don't need to set touched and dirty for this kind of update.
          // This update usually happens for language change, formula or updates on same entity in another Edit Ui.
          // In case controls should be updated, update with control.markAsTouched and control.markAsDirty.
          // Marking the form will not mark controls, but marking controls marks the form
          form.patchValue(changes);
        }

        // 3. sync disabled
        this.log.a('sync disabled');
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!form.controls.hasOwnProperty(fieldName)) continue;
          const control = form.controls[fieldName];
          const disabled = fieldProps.settings.Disabled || fieldProps.settings.ForcedDisabled;
          // WARNING!!! Fires valueChange event for every single control
          ControlHelpers.disableControl(control, disabled);
        }

        // 4. run validators - required because formulas can recalculate validators and if value doesn't change, new validator will not run
        this.log.a('run validators');
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!form.controls.hasOwnProperty(fieldName)) continue;
          form.controls[fieldName].updateValueAndValidity();
        }
      })
    );

    const formValid$ = form.valueChanges.pipe(
      map(() => !form.invalid),
      startWith(!form.invalid),
      mapUntilChanged(m => m),
      // distinctUntilChanged(),
    );
    const itemHeader$ = this.itemService.getItemHeader$(this.entityGuid);
    this.subscriptions.add(
      combineLatest([formValid$, itemHeader$]).pipe(
        map(([formValid, itemHeader]) => {
          if (itemHeader.IsEmpty) return true;
          return formValid;
        }),
        mapUntilChanged(m => m),
        // distinctUntilChanged(),
      ).subscribe(isValid => {
        this.formsStateService.setFormValid(this.entityGuid, isValid);
      })
    );
    this.subscriptions.add(
      form.valueChanges.pipe(
        map(() => form.dirty),
        startWith(form.dirty),
        // distinctUntilChanged(), // cant have distinctUntilChanged because dirty state is not reset on form save
      ).subscribe(isDirty => {
        this.formsStateService.setFormDirty(this.entityGuid, isDirty);
      })
    );

    this.subscriptions.add(
      form.valueChanges.pipe(
        map(() => form.getRawValue() as FormValues),
        distinctUntilChanged((previous, current) => ControlHelpers.getFormChanges(previous, current) == null),
      ).subscribe((formValues) => {
        const language = this.formConfig.language();// this.languageStore.getLanguage(this.formConfig.config.formId);
        this.itemService.updateItemAttributesValues(this.entityGuid, formValues, language);
      })
    );
  }

  ngOnDestroy() {
    Object.values(this.form.controls).forEach((control: SxcAbstractControl) => {
      control._warning$.complete();
    });
    super.ngOnDestroy();
  }
}
