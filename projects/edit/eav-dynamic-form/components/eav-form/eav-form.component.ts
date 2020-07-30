import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FieldConfigSet, FieldConfigGroup } from '../../model/field-config';
import { environment } from '../../../../ng-dialogs/src/environments/environment';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { EavService } from '../../../shared/services/eav.service';

@Component({
  selector: 'app-eav-form',
  templateUrl: './eav-form.component.html',
  styleUrls: ['./eav-form.component.scss']
})
export class EavFormComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet[] = [];
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() formValueChange: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup = new FormGroup({});
  showDebugItems = false;

  private subscriptions: Subscription[] = [];

  get changes() { return this.form.valueChanges; }
  get valid() { return !this.form.invalid; }
  get value() { return this.form.value; }
  get dirty() { return this.form.dirty; }
  get debugEnviroment() { return !environment.production; }

  constructor(private formBuilder: FormBuilder, private eavService: EavService) { }

  ngOnInit() {
    this.createControlsInFormGroup(this.config);

    this.subscriptions.push(
      this.form.valueChanges.subscribe(val => {
        this.formValueChange.emit(val);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
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

  save() {
    angularConsoleLog('form save');
    // Use this to emit value out
    this.formSubmit.emit(this.value);
  }

  submitOutside() {
    this.save();
  }

  setDisabled(name: string, disable: boolean, emitEvent: boolean) {
    if (this.form.controls[name]) {
      if (disable) {
        this.form.controls[name].disable({ emitEvent });
      } else {
        this.form.controls[name].enable({ emitEvent });
      }
      const config = this.config.find(cfg => cfg.field.name === name);
      this.eavService.formDisabledChanged$$.next({ formId: config.form.formId, entityGuid: config.entity.entityGuid });
    }
  }

  /**
   * Set form control value.
   * If emitEvent is true, this change will cause a valueChanges event on the FormControl to be emitted.
   * This defaults to true (as it falls through to updateValueAndValidity)
   */
  setValue(name: string, value: any, emitEvent: boolean) {
    if (value !== this.form.controls[name].value) {
      angularConsoleLog('CHANGE' + name + ' from value: ' + this.form.controls[name].value + ' to ' + value);
      this.form.controls[name].setValue(value, { emitEvent });
    }
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
  public valueIsChanged = (values: { [key: string]: any }) => {
    let valueIsChanged = false;
    angularConsoleLog('[Test Disabled] VALUECHANGED values', values);
    angularConsoleLog('[Test Disabled] VALUECHANGED form values', this.form.value);

    Object.keys(values).forEach(valueKey => {
      if (values[valueKey] !== this.form.value[valueKey]) {
        valueIsChanged = true;
      }
    });

    angularConsoleLog('[Test Disabled] VALUECHANGED', valueIsChanged);
    return valueIsChanged;
  }
}
