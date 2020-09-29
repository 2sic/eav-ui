import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigGroup, FieldConfigSet } from '../../model/field-config';

@Component({
  selector: 'app-eav-form',
  templateUrl: './eav-form.component.html',
  styleUrls: ['./eav-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EavFormComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet[] = [];
  @Output() private formSubmit = new EventEmitter<void>();
  @Output() private formValueChange = new EventEmitter<any>();

  form: FormGroup = new FormGroup({});
  private subscription = new Subscription();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createControlsInFormGroup(this.config);

    this.subscription.add(
      this.form.valueChanges.subscribe(val => {
        this.formValueChange.emit(val);
      })
    );
  }

  ngOnDestroy() {
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
  private createControlsInFormGroup(fieldConfigArray: FieldConfigSet[]) {
    try {
      fieldConfigArray.forEach(fieldConfig => {
        const field = fieldConfig.field as FieldConfigGroup;
        if (field.fieldGroup) {
          this.createControlsInFormGroup(field.fieldGroup);
        } else {
          this.form.addControl(fieldConfig.field.name, this.createControl(fieldConfig));
        }
      });
      return this.form;
    } catch (error) {
      console.error(`Error creating form controls: ${error}\nFieldConfig: ${fieldConfigArray}`);
      throw error;
    }
  }

  /** Create form control */
  private createControl(config: FieldConfigSet) {
    try {
      const { disabled, validation, initialValue } = config.field;
      return this.formBuilder.control({ disabled, value: initialValue }, validation);
    } catch (error) {
      console.error(`Error creating form control: ${error}\nConfig: ${config}`);
      throw error;
    }
  }

}
