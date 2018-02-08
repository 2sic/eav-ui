import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { MatInput, MatSelect } from '@angular/material';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';
import { SelectOption } from '@ngx-formly/material/src/types/select';


@Component({
  selector: 'app-string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.css']
})
export class StringDropdownComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput) matInput: MatInput;
  @ViewChild(MatSelect) matSelect: MatSelect;
  errorStateMatcher = new FormlyErrorStateMatcher(this);

  get labelProp(): string { return this.to.labelProp || 'label'; }
  get valueProp(): string { return this.to.valueProp || 'value'; }
  get groupProp(): string { return this.to.groupProp || 'group'; }

  private _selectOptions: SelectOption[] = [];
  private _oldOptions: SelectOption[] = [];

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    if (this.field['__formField__']) {
      if (this.to.freeTextMode) {
        this.field['__formField__']._control = this.matInput;
      } else {
        this.field['__formField__']._control = this.matSelect;
      }
    }
    super.ngAfterViewInit();
  }

  get selectOptions() {
    this.to.options = this.setOptionsFromDropdownValues();

    // This text is default code of formly material select
    if (this.to.options.length === this._oldOptions.length
      && this._oldOptions.every(opt => !!this.to.options.find(o => o[this.valueProp] === opt[this.valueProp]))
    ) {
      return this._selectOptions;
    }

    this._oldOptions = [...this.to.options];
    this._selectOptions = [];
    const groups: { [key: string]: SelectOption[] } = {};
    this.to.options.map((option: SelectOption) => {
      if (!option[this.groupProp]) {
        this._selectOptions.push(option);
      } else {
        if (groups[option[this.groupProp]]) {
          groups[option[this.groupProp]].push(option);
        } else {
          groups[option[this.groupProp]] = [option];
          this._selectOptions.push({
            label: option[this.groupProp],
            group: groups[option[this.groupProp]],
          });
        }
      }
    });

    return this._selectOptions;
  }

  /**
   * Read settings Dropdown values
   */
  private setOptionsFromDropdownValues(): any {
    let options = [];
    if (this.to.settings.DropdownValues) {
      const dropdownValues = this.to.settings.DropdownValues.values[0].value;
      options = dropdownValues.replace(/\r/g, '').split('\n');
      options = options.map(e => {
        const s = e.split(':');
        const maybeWantedEmptyVal = s[1];
        const key = s.shift(); // take first, shrink the array
        const val = s.join(':');
        return {
          label: key,
          value: (val || maybeWantedEmptyVal === '') ? val : key
        };
      });
    }

    return options;
  }
}
