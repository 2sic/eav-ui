import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { GeneralHelpers } from '../../../shared/helpers';
import { EavService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';

@Component({
  selector: 'app-eav-form',
  templateUrl: './eav-form.component.html',
  styleUrls: ['./eav-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EavFormComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  form: FormGroup;
  private subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private eavService: EavService,
    private formsStateService: FormsStateService,
    private itemService: ItemService,
    private fieldsSettingsService: FieldsSettingsService,
    private languageInstanceService: LanguageInstanceService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({});
    this.subscription = new Subscription();
    this.subscription.add(
      this.fieldsSettingsService.getFieldsProps$().subscribe(fieldsProps => {
        // 1. create missing controls
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          const empties = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd];
          if (empties.includes(fieldProps.calculatedInputType.inputType)) { continue; }

          const control = this.form.controls[fieldName];
          if (control != null) { continue; }

          const value = fieldProps.value;
          const disabled = fieldProps.settings.Disabled;
          const validation = fieldProps.validators;
          const newControl = this.formBuilder.control({ disabled, value }, validation);
          this.form.addControl(fieldName, newControl);
        }

        // 2. sync values
        const oldValues: FormValues = this.form.getRawValue();
        const newValues: FormValues = {};
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!this.form.controls.hasOwnProperty(fieldName)) { continue; }
          newValues[fieldName] = fieldProps.value;
        }

        const changes = GeneralHelpers.getFormChanges(oldValues, newValues);
        if (changes != null) {
          this.form.patchValue(changes);
        }

        // 3. sync disabled
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!this.form.controls.hasOwnProperty(fieldName)) { continue; }
          const control = this.form.controls[fieldName];
          const disabled = fieldProps.settings.Disabled;
          if (disabled === control.disabled) { continue; }

          // WARNING!!! Fires valueChange event for every single control
          if (disabled) {
            control.disable();
          } else {
            control.enable();
          }
        }

        // TODO: 4. sync validators
      })
    );

    const formValid$ = this.form.statusChanges.pipe(
      map(() => !this.form.invalid),
      startWith(!this.form.invalid),
      distinctUntilChanged(),
    );
    const itemHeader$ = this.itemService.getItemHeader$(this.entityGuid);
    this.subscription.add(
      combineLatest([formValid$, itemHeader$]).pipe(
        map(([formValid, itemHeader]) => {
          if (itemHeader.Group?.SlotIsEmpty) { return true; }
          return formValid;
        }),
        distinctUntilChanged(),
      ).subscribe(isValid => {
        this.formsStateService.setFormValid(this.entityGuid, isValid);
      })
    );
    this.subscription.add(
      this.form.valueChanges.pipe(
        map(() => this.form.dirty),
        startWith(this.form.dirty),
        // distinctUntilChanged(), // cant have distinctUntilChanged because dirty state is not reset on form save
      ).subscribe(isDirty => {
        this.formsStateService.setFormDirty(this.entityGuid, isDirty);
      })
    );

    this.subscription.add(
      this.form.valueChanges.subscribe(() => {
        const formValues = this.form.getRawValue();
        const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
        const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
        this.itemService.updateItemAttributesValues(this.entityGuid, formValues, currentLanguage, defaultLanguage);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
