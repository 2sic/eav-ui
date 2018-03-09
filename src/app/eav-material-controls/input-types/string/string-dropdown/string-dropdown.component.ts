import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput, MatSelect } from '@angular/material';
import { Field } from '../../../../eav-dynamic-form/model/field.interface';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.css']
})
export class StringDropdownComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;

  freeTextMode = false;

  selectOptions = [];

  private _selectOptions: string[] = [];
  private _oldOptions: string[] = [];

  ngOnInit() {
    this.selectOptions = this.setOptionsFromDropdownValues();
    console.log('this.config.settings.DropdownValues:', this.config.settings.DropdownValues);
  }
  // @ViewChild(MatInput) matInput: MatInput;
  // @ViewChild(MatSelect) matSelect: MatSelect;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

  // get labelProp(): string { return this.config['labelProp'] || 'label'; }
  // get valueProp(): string { return this.config['valueProp'] || 'value'; }
  // get groupProp(): string { return this.config['groupProp'] || 'group'; }

  // ngOnInit() {
  //   super.ngOnInit();
  // }

  // ngAfterViewInit() {
  //   if (this.field['__formField__']) {
  //     if (this.to.freeTextMode) {
  //       this.field['__formField__']._control = this.matInput;
  //     } else {
  //       this.field['__formField__']._control = this.matSelect;
  //     }
  //   }
  //   super.ngAfterViewInit();
  // }

  // get selectOptions() {

  // this._selectOptions = this.setOptionsFromDropdownValues();
  // console.log("sadsad", this.config.options);
  // This text is default code of formly material select
  // if (this.config.options.length === this._oldOptions.length
  //   && this._oldOptions.every(opt => !!this.config.options.find(o => o['value'] === opt['value']))
  // ) {
  //   return this._selectOptions;
  // }

  // this._oldOptions = [...this.config.options];
  // this._selectOptions = [];

  // this.config.options.map((option: SelectOption) => {

  // }
  // const groups: { [key: string]: SelectOption[] } = {};
  // this.config.options.map((option: SelectOption) => {
  //   if (!option[this.groupProp]) {
  //     this._selectOptions.push(option);
  //   } else {
  //     if (groups[option[this.groupProp]]) {
  //       groups[option[this.groupProp]].push(option);
  //     } else {
  //       groups[option[this.groupProp]] = [option];
  //       this._selectOptions.push({
  //         label: option[this.groupProp],
  //         group: groups[option[this.groupProp]],
  //       });
  //     }
  //   }
  // });
  // }

  /**
   * Read settings Dropdown values
   */
  private setOptionsFromDropdownValues(): any {
    let options = [];
    if (this.config.settings.DropdownValues) {
      const dropdownValues = this.config.settings.DropdownValues.values[0].value;
      options = dropdownValues.replace(/\r/g, '').split('\n');
      options = options.map(e => {
        const s = e.split(':');
        const maybeWantedEmptyVal = s[1];
        const key = s.shift(); // take first, shrink the array
        const val = s.join(':');
        return {
          label: key,
          value: (val) ? val : key
        };
      });
    }
    return options;

  }
}
