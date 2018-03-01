import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { FieldConfig } from '../../model/field-config.interface';

@Component({
  exportAs: 'appEavForm',
  templateUrl: './eav-form.component.html',
  selector: 'app-eav-form',
  styleUrls: ['./eav-form.component.css']
})
export class EavFormComponent implements OnChanges, OnInit {
  @Input()
  config: FieldConfig[] = [];

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;

  //get controls() { return this.config.filter(({ type }) => type !== 'button'); }
  // get controls() { return this.config }
  get changes() { return this.form.valueChanges; }
  get valid() { return this.form.valid; }
  get value() { return this.form.value; }

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.createControlsInFormGroup(this.config);
    console.log('this.config sdfdsf:', JSON.stringify(this.config));
    console.log('group evo je:', JSON.stringify(this.form.value));
  }

  ngOnChanges() {
    // TODO: see is this working
    if (this.form) {
      const controls = Object.keys(this.form.controls);
      const configControls = this.config.map((item) => item.name);

      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => this.form.removeControl(control));

      configControls
        .filter((control) => !controls.includes(control))
        .forEach((name) => {
          const config = this.config.find((control) => control.name === name);
          this.form.addControl(name, this.createControl(config));
        });
    }
  }

  /**
   * Create form from configuration
   * @param fieldConfigArray 
   */
  createControlsInFormGroup(fieldConfigArray: FieldConfig[]) {
    const group = this.formBuilder.group({});
    fieldConfigArray.forEach(fieldConfig => {
      if (fieldConfig.fieldGroup) {
        group.addControl(fieldConfig.name, this.createControlsInFormGroup(fieldConfig.fieldGroup));
      } else {
        group.addControl(fieldConfig.name, this.createControl(fieldConfig))
      }
    }
    );

    return group;
  }

  /**
   *  Create form control
   * @param config
   */
  createControl(config: FieldConfig) {
    const { disabled, validation, value } = config;
    return this.formBuilder.control({ disabled, value }, validation);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.submit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean) {
    if (this.form.controls[name]) {
      const method = disable ? 'disable' : 'enable';
      this.form.controls[name][method]();
      return;
    }

    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  setValue(name: string, value: any) {
    this.form.controls[name].setValue(value, { emitEvent: true });
  }
}

