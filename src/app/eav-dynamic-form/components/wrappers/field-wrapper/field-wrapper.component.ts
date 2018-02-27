import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '../../../model/field-wrapper';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-field-wrapper',
  templateUrl: './field-wrapper.component.html',
  styleUrls: ['./field-wrapper.component.css']
})
export class FieldWrapperComponent extends FieldWrapper implements OnInit {// , MatFormFieldControl<any>
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  // @ViewChild(MatFormField) formField: MatFormField;

  // stateChanges = new Subject<void>();
  // _errorState = false;

  ngOnInit() {
    //   this.formField._control = this;
    //   (<any>this.config)['__formField__'] = this.formField;
  }

  // ngOnDestroy() {
  //   delete (<any>this.config)['__formField__'];
  //   this.stateChanges.complete();
  // }

  // setDescribedByIds(ids: string[]): void { }
  // // onContainerClick(event: MouseEvent): void {
  // //   this.field.focus = true;
  // //   this.stateChanges.next();
  // // }

  // // get errorState() {
  // //   const showError = this.options.showError(this);
  // //   if (showError !== this._errorState) {
  // //     this._errorState = showError;
  // //     this.stateChanges.next();
  // //   }

  // //   return showError;
  // // }
  // get controlType() { return this.config.type; }
  // //get focused() { return this.config.focus && !this.disabled; }
  // get disabled() { return this.config.disabled; }
  // get required() { return this.config.required; }
  // get placeholder() { return this.config.placeholder; }
  // get shouldPlaceholderFloat() { return !!this.config.placeholder; }
  // get value() { return this.formControl.value; }
  // get ngControl() { return this.formControl as any; }
  // get empty() { return !this.formControl.value; }
  // // get shouldLabelFloat() { return this.focused || !this.empty; }
  // // focusMonitor(elements: any[] = []) {
  // //   //console.warn(`${this.config.key}: 'focusMonitor' is deprecated, and it will be removed in the next major version.`);
  // // }
}
