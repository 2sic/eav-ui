import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class NumberDefaultComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;

  decimal: string;
  // max: number;
  // min: number;

  ngOnInit(): void {

    // TODO: get default Validations - first get default validators from settings then add field validators
    // const validation: ValidatorFn[] = [];
    // const decimal = this.config.settings.Decimals ? '^[0-9]+(\.[0-9]{1,' + this.config.settings.Decimals.values[0].value + '})?$' : null;
    // if (decimal) {
    //   validation.push(Validators.pattern(decimal));
    // }
    // const max = this.config.settings.Max ? this.config.settings.Max.values[0].value : 0;
    // if (max > 0) {
    //   validation.push(Validators.max(max));
    // }
    // const min = this.config.settings.Min ? this.config.settings.Min.values[0].value : 0;
    // if (min > 0) {
    //   validation.push(Validators.min(min));
    // }
    // this.group.controls[this.config.name].setValidators(validation);

    // TODO: see do we need this
    // -------------------------------
    // Remove the validator from the control in the FormGroup:
    // this.myForm.controls['controlName'].clearValidators()

    // Update the FormGroup once you have run either of the above lines.
    // this.myForm.controls['controlName'].updateValueAndValidity()
    // -------------------------------

    this.decimal = this.config.settings.Decimals ? `^[0-9]+(\.[0-9]{1,${this.config.settings.Decimals.values[0].value}})?$` : null;
    // this.max = this.config.settings.Max ? this.config.settings.Max.values[0].value : null;
    // this.min = this.config.settings.Min ? this.config.settings.Min.values[0].value : null;
  }

  // get decimal() {
  //   return this.config.settings.Decimals ? `^[0-9]+(\.[0-9]{1,${this.config.settings.Decimals.values[0].value}})?$` : null;
  // }

  // get max() {
  //   console.log('Max', this.config.settings.Max.values[0].value);
  //   return this.config.settings.Max ? this.config.settings.Max.values[0].value : null;
  // }

  // get min() {
  //   return this.config.settings.Min ? this.config.settings.Min.values[0].value : null;
  // }
}
