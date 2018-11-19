import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AbstractControl } from '@angular/forms';

// @Injectable()
export class FieldMaskService {

  // private mask: string;
  // model: $scope.model,
  private fields: string[] = [];
  // value: undefined,
  private findFields = /\[.*?\]/ig;
  private unwrapField = /[\[\]]/ig;

  constructor(private mask: string,
    private changeEvent: any,
    private overloadPreCleanValues: any,
    private model: { [key: string]: AbstractControl; }) {
    this.mask = mask;
    this.model = model;
    this.fields = this.fieldList();

    if (overloadPreCleanValues) { // got an overload...
      this.preClean = overloadPreCleanValues;
    }
  }

  public preClean = (key, value) => {
    return value;
  }

  // retrieves a list of all fields used in the mask
  public fieldList = () => {
    const result = [];
    if (!this.mask) { return result; }
    const matches = this.mask.match(this.findFields);
    if (matches) {
      matches.forEach((e, i) => {
        const staticName = e.replace(this.unwrapField, '');
        result.push(staticName);
      });
    } else { // TODO: ask is this good
      result.push(this.mask);
    }
    return result;
  }

  // resolves a mask to the final value
  // getNewAutoValue()
  // this.model = this.group.controls (group is FormGroup)
  resolve = () => {
    let value = this.mask;
    this.fields.forEach((e, i) => {
      const replaceValue = this.model.hasOwnProperty(e) && this.model[e] && this.model[e].value ? this.model[e].value : '';
      const cleaned = this.preClean(e, replaceValue);
      value = value.replace('[' + e + ']', cleaned);
    });

    console.log('resolve:', value);
    return value;
  }
}

