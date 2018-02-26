import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Validators } from '@angular/forms';

// import { FieldConfig } from './' './dynamic-form/models/field-config.interface';
// import { DynamicFormComponent } from  './dynamic-form/containers/dynamic-form/dynamic-form.component';
//TODO: fix this dependency - from other module - move maybe to shared
import { FieldConfig } from '../../eav-form/model/field-config.interface';
//TODO: fix this dependency 
import { EavFormComponent } from '../../eav-form/components/eav-form/eav-form.component';

@Component({
  selector: 'app-new-item-form',
  templateUrl: './new-item-form.component.html',
  styleUrls: ['./new-item-form.component.css']
})
export class NewItemFormComponent implements AfterViewInit {
  @ViewChild(EavFormComponent) form: EavFormComponent;

  config: FieldConfig[] = [
    {
      type: 'input',
      label: 'Full name',
      name: 'name',
      placeholder: 'Enter your name',
      validation: [Validators.required, Validators.minLength(4)]
    },
    {
      type: 'input',
      label: 'Last name',
      name: 'lastname',
      placeholder: 'Enter your name2',
      validation: [Validators.required, Validators.minLength(4)]
    }
  ];

  ngAfterViewInit() {
    // let previousValid = this.form.valid;
    // this.form.changes.subscribe(() => {
    //   if (this.form.valid !== previousValid) {
    //     previousValid = this.form.valid;
    //     //this.form.setDisabled('submit', !previousValid);
    //   }
    // });

    //this.form.setDisabled('submit', true);
    this.form.setValue('name', 'Ante');
    this.form.setValue('lastname', 'Gadzo');
  }

  submit(value: { [name: string]: any }) {
    console.log(value);
  }
}
