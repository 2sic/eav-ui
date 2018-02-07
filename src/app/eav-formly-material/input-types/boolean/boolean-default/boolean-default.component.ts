import { Component, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.css']
})
export class BooleanDefaultComponent extends FieldType implements AfterViewInit {
  @ViewChild(MatCheckbox) matCheckbox: MatCheckbox;

  constructor(private renderer?: Renderer2) {
    super();
  }

  ngAfterViewInit() {
    const formField = (<any>this.field)['__formField__'];
    if (formField) {
      formField._control.focusMonitor([this.matCheckbox._inputElement.nativeElement]);

      // temporary fix for https://github.com/angular/material2/issues/7891
      if (formField.underlineRef && this.renderer) {
        this.renderer.removeClass(formField.underlineRef.nativeElement, 'mat-form-field-underline');
      }
    }
    super.ngAfterViewInit();
  }
}
