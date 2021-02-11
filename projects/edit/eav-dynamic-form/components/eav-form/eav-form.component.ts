import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { EavService } from '../../..';
import { BuildFieldsService } from '../../../eav-item-dialog/item-edit-form/build-fields.service';
import { FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { FormsStateService } from '../../../shared/services/forms-state.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { FieldConfigSet } from '../../model/field-config';

@Component({
  selector: 'app-eav-form',
  templateUrl: './eav-form.component.html',
  styleUrls: ['./eav-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EavFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() entityGuid: string;
  @Input() entityId: string;
  @Input() fieldConfigs: FieldConfigSet[];
  @Output() private formValueChange = new EventEmitter<FormValues>();

  form: FormGroup;
  private subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private fieldsSettingsService: FieldsSettingsService,
    private buildFieldsService: BuildFieldsService,
    private eavService: EavService,
    private formsStateService: FormsStateService,
    private itemService: ItemService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({});
    this.subscription = new Subscription();
    this.createControlsInFormGroup(this.fieldConfigs);

    const formValid$ = this.form.statusChanges.pipe(
      map(() => !this.form.invalid),
      startWith(!this.form.invalid),
      distinctUntilChanged(),
    );
    const itemHeader$ = this.itemService.selectItemHeader(this.entityGuid);
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
      this.eavService.formValueChange$.pipe(
        filter(formSet => formSet.formId === this.eavService.eavConfig.formId),
        map(() => this.form.dirty),
        // distinctUntilChanged(), // cant have distinctUntilChanged because dirty state is not reset on form save
      ).subscribe(isDirty => {
        this.formsStateService.setFormDirty(this.entityGuid, isDirty);
      })
    );
  }

  ngAfterViewInit() {
    this.buildFieldsService.startTranslations(this.fieldConfigs, this.form, this.fieldsSettingsService);

    this.subscription.add(
      this.form.valueChanges.subscribe((formValues: FormValues) => {
        this.formValueChange.emit(formValues);
      })
    );
  }

  ngOnDestroy() {
    this.buildFieldsService.stopTranslations(this.fieldConfigs);
    this.subscription.unsubscribe();
  }

  /** Create form from configuration */
  private createControlsInFormGroup(fieldConfigs: FieldConfigSet[]) {
    try {
      fieldConfigs.forEach(fieldConfig => {
        const field = fieldConfig.field;
        if (field._fieldGroup) {
          this.createControlsInFormGroup(field._fieldGroup);
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
