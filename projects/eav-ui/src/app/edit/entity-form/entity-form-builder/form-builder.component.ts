import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, distinctUntilChanged, filter, map, startWith, take } from 'rxjs';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { AbstractControlPro, AdamCacheService, ItemService } from '../../shared/store/ngrx-data';
import { FieldLogicWithValueInit } from '../../fields/logic/field-logic-with-init';
import { FieldLogicManager } from '../../fields/logic/field-logic-manager';
import { EntityFormComponent } from '../entity-form-component/entity-form.component';
import { ControlHelpers } from '../../shared/helpers/control.helpers';
import { EntityFormStateService } from '../entity-form-state.service';
import { FormulaDesignerService } from '../../formulas/formula-designer.service';
import { EmptyFieldHelpers } from '../../fields/basic/empty-field-helpers';
import { ValidationHelpers } from '../../shared/validation/validation.helpers';
import { BaseComponent } from '../../../shared/components/base.component';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { FormConfigService } from '../../state/form-config.service';
import { FormsStateService } from '../../state/forms-state.service';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';

const logThis = true;
const nameOfThis = 'FormBuilderComponent';

@Component({
  selector: 'app-edit-entity-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EntityFormComponent,
  ],
  providers: [
    FieldsSettingsService,  // used for all field settings - must be shared from here
    FieldsTranslateService, // used for field translations and uses FieldsSettingsService, so also shared here
    // new
    EntityFormStateService,
  ],
})
export class EntityFormBuilderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  form = new UntypedFormGroup({});

  /** Inject the form state service, but automatically add the form for later use */
  #formStateService = inject(EntityFormStateService).setup(this.form);

  #formulaDesignerService = inject(FormulaDesignerService);

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
    this.#formulaDesignerService.itemSettingsServices[this.entityGuid] = this.fieldsSettingsService;
    this.fieldsTranslateService.init(this.entityGuid);

    const form = this.form;

    const fieldProps$ = this.fieldsSettingsService.getFieldsProps$();

    // 1. Prepare: Take field props and enrich initial values and input types
    const fieldsToProcess = fieldProps$.pipe(
      filter(fields => fields != null && Object.keys(fields).length > 0),
      map(allFields => {
        const fields = Object.entries(allFields).map(([fieldName, fieldProps]) => {
          const hasControl = form.controls.hasOwnProperty(fieldName);
          const control = hasControl ? form.controls[fieldName] : null;
          return {
            fieldName,
            fieldProps,
            inputType: fieldProps.constants.inputCalc.inputType,
            value: fieldProps.buildValue,
            hasControl,
            control,
          };
        });
        return fields;
      }),
    );

    // Create all the controls in the form right at the beginning
    fieldsToProcess.pipe(take(1)).subscribe(allFields => {
      // 1. create missing controls - usually just on first cycle
      const fieldsToCreate = allFields.filter(({ inputType, hasControl }) =>
        // Empty type, skip
        !EmptyFieldHelpers.isEmptyInputType(inputType)

        // If control already exists, skip
        && !hasControl
      );

      this.log.a(`create missing controls ${fieldsToCreate.length} of ${allFields.length}`, { fieldsForNgForm: fieldsToCreate });

      // Generate any fields which don't exist yet (usually only on first cycle)
      for (const fields of fieldsToCreate) {
        const { fieldName, fieldProps, inputType, value } = fields;
        // The initial value at the moment the control is first created in this language
        let initialValue = value;

        // Special treatment for wysiwyg fields
        // Note by 2dm 2024-08-19 - not sure if this actually works, because the changed buildValue is maybe never reused
        // ...except for directly below
        if (inputType === InputTypeConstants.StringWysiwyg && initialValue) {
          const logic = FieldLogicManager.singleton().get(InputTypeConstants.StringWysiwyg);
          const adamItems = this.adamCacheService.getAdamSnapshot(this.entityGuid, fieldName);
          fields.value = initialValue = (logic as unknown as FieldLogicWithValueInit).processValueOnLoad(initialValue, adamItems);
        }

        // Build control in the Angular form with validators
        const disabled = fieldProps.settings.Disabled || fieldProps.settings.ForcedDisabled;
        const validators = ValidationHelpers.getValidators(fieldName, inputType, this.fieldsSettingsService);
        const newControl = this.formBuilder.control({ disabled, value: initialValue }, validators);
        // TODO: build all fields at once. That should be faster
        form.addControl(fieldName, newControl);
        ValidationHelpers.ensureWarning(form.controls[fieldName]);
      }
    });

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
        for (const { fieldName, value } of fieldsOnForm)
          newValues[fieldName] = value;

        const changes = ControlHelpers.getFormChanges(oldValues, newValues);
        if (changes != null) {
          this.log.a(`patching form as it changed (${Object.keys(changes).length}`, { changes, oldValues, newValues })
          // controls probably don't need to set touched and dirty for this kind of update.
          // This update usually happens for language change, formula or updates on same entity in another Edit Ui.
          // In case controls should be updated, update with control.markAsTouched and control.markAsDirty.
          // Marking the form will not mark controls, but marking controls marks the form
          form.patchValue(changes);
        }

        // 3. sync disabled if state not matching
        this.log.a('sync "disabled" state');
        for (const { control, fieldProps } of fieldsOnForm) {
          const disabled = fieldProps.settings.Disabled || fieldProps.settings.ForcedDisabled;
          // WARNING!!! Fires valueChange event for every single control
          ControlHelpers.disableControl(control, disabled);
        }

        // 4. run validators - required because formulas can recalculate validators and if value doesn't change, new validator will not run
        this.log.a('run validators');
        for (const { control } of fieldsOnForm)
          control.updateValueAndValidity();
      })
    );

    
    const formValid$ = form.valueChanges.pipe(
      map(() => !form.invalid),
      startWith(!form.invalid),
      mapUntilChanged(m => m),
    );

    const itemHeader$ = this.itemService.getItemHeader$(this.entityGuid);
    this.subscriptions.add(
      combineLatest([formValid$, itemHeader$]).pipe(
        map(([formValid, itemHeader]) => itemHeader.IsEmpty || formValid),
        mapUntilChanged(m => m),
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
        map(() => form.getRawValue() as ItemValuesOfLanguage),
        distinctUntilChanged((previous, current) => ControlHelpers.getFormChanges(previous, current) == null),
      ).subscribe((formValues) => {
        const language = this.formConfig.language();
        this.itemService.updater.updateItemAttributesValues(this.entityGuid, formValues, language);
      })
    );
  }

  ngOnDestroy() {
    Object.values(this.form.controls).forEach((control: AbstractControlPro) => {
      control._warning$.complete();
    });
    super.ngOnDestroy();
  }
}
