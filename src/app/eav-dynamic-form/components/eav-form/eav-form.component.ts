import { Component, EventEmitter, Input, OnChanges, OnInit, Output, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective } from '@angular/forms';

import { FieldConfigSet, FieldConfigGroup } from '../../model/field-config';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  exportAs: 'appEavForm',
  templateUrl: './eav-form.component.html',
  selector: 'app-eav-form',
  styleUrls: ['./eav-form.component.scss']
})
export class EavFormComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild('dynamicForm') dynamicForm: FormGroupDirective;

  @Input()
  config: FieldConfigSet[] = [];

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  formValueChange: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup = new FormGroup({});
  showDebugItems = false;

  private subscriptions: Subscription[] = [];

  get changes() { return this.form.valueChanges; }
  get valid() { return this.form.valid; }
  get value() { return this.form.value; }
  get dirty() { return this.form.dirty; }
  get debugEnviroment() {
    return !environment.production;
  }

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    // let group = this.formBuilder.group({});
    this.createControlsInFormGroup(this.config);

    this.subscriptions.push(
      this.form.valueChanges.subscribe(val => {
        // if (this.form.valid) {
        // this.formErrors = this.FormService.validateForm(this.form, this.formErrors, true);

        this.formValueChange.emit(val);
        // }
      }));
  }

  ngOnChanges() {
    // console.log('ngOnChanges EavFormComponent');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * Create form from configuration
   * @param fieldConfigArray
   */
  private createControlsInFormGroup(fieldConfigArray: FieldConfigSet[]) {
    try {
      // const group = this.formBuilder.group({});
      fieldConfigArray.forEach(fieldConfig => {
        const field = fieldConfig.field as FieldConfigGroup;
        if (field.fieldGroup) {
          this.createControlsInFormGroup(field.fieldGroup);
        } else {
          this.form.addControl(fieldConfig.field.name, this.createControl(fieldConfig));
        }
      }
      );

      return this.form;
    } catch (error) {
      console.error(`Error creating form controls: ${error}
      FieldConfig: ${fieldConfigArray}`);
      throw error;
    }
  }

  /**
   *  Create form control
   * @param config
   */
  private createControl(config: FieldConfigSet) {
    try {
      // tslint:disable-next-line:prefer-const
      let { disabled, validation, value } = config.field;
      return this.formBuilder.control({ disabled, value }, validation);
    } catch (error) {
      console.error(`Error creating form control: ${error}
      Config: ${config}`);
      throw error;
    }
  }

  save(event) {
    console.log('form save', event);
    // Use this to emit value out
    this.submit.emit(this.value);
  }

  submitOutside() {
    this.dynamicForm.ngSubmit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean, emitEvent: boolean) {
    if (this.form.controls[name]) {
      if (disable) {
        this.form.controls[name].disable({ emitEvent: emitEvent });
      } else {
        this.form.controls[name].enable({ emitEvent: emitEvent });
      }
    }
  }

  /**
   * Set form control value
   * @param name
   * @param value
   * @param emitEvent If emitEvent is true, this change will cause a valueChanges event on the FormControl
   * to be emitted. This defaults to true (as it falls through to updateValueAndValidity).
   */
  setValue(name: string, value: any, emitEvent: boolean) {
    if (value !== this.form.controls[name].value) {
      console.log('CHANGE' + name + ' from value: ' + this.form.controls[name].value + ' to ' + value);
      this.form.controls[name].setValue(value, { emitEvent: emitEvent });
    }
  }

  /**
   * Patch values to formGroup. It accepts an object with control names as keys, and will do it's best to
   * match the values to the correct controls in the group.
   * @param values
   * @param emitEvent If emitEvent is true, this change will cause a valueChanges event on the FormGroup
   * to be emitted. This defaults to true (as it falls through to updateValueAndValidity).
   */
  patchValue(values: { [key: string]: any }, emitEvent: boolean) {
    // if (this.valueIsChanged(values)) {
    // console.log('value patchValue');
    this.form.patchValue(values, { emitEvent: emitEvent });
    // }
  }

  /**
   * Check is value in form changed
   *
  */
  public valueIsChanged = (values: { [key: string]: any }) => {
    let valueIsChanged = false;
    console.log('[Test Disabled] VALUECHANGED values', values);
    console.log('[Test Disabled] VALUECHANGED form values', this.form.value);
    Object.keys(this.form.value).forEach(valueKey => {
      if (this.form.value[valueKey] !== values[valueKey]) {
        valueIsChanged = true;
      }
    });

    console.log('[Test Disabled] VALUECHANGED', valueIsChanged);
    return valueIsChanged;
  }
}
