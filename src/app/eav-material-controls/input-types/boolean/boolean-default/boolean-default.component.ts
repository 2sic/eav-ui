import { Component, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class BooleanDefaultComponent implements Field {
  config: FieldConfigSet;
  group: FormGroup;
  @ViewChild(MatCheckbox) matCheckbox: MatCheckbox;

  // constructor(private renderer?: Renderer2) {
  //   super();
  // }

  // ngAfterViewInit() {
  //   // const formField = (<any>this.field)['__formField__'];
  //   // if (formField) {
  //   //   formField._control.focusMonitor([this.matCheckbox._inputElement.nativeElement]);

  //   //   // temporary fix for https://github.com/angular/material2/issues/7891
  //   //   if (formField.underlineRef && this.renderer) {
  //   //     this.renderer.removeClass(formField.underlineRef.nativeElement, 'mat-form-field-underline');
  //   //   }
  //   // }
  //   //super.ngAfterViewInit();
  // }
}
