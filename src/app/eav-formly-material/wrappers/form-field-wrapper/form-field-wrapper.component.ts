import { Component, ViewChild, ViewContainerRef, OnInit, OnDestroy, NgZone, Renderer2 } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operator/takeUntil';

/**
 * This component if copy of FormlyWrapperFormField from '@ngx-formly/material'
 * Added here to have control over field-wrapper
 */

@Component({
  selector: 'app-form-field-wrapper',
  templateUrl: './form-field-wrapper.component.html',
  styleUrls: ['./form-field-wrapper.component.css'],
  providers: [{ provide: MatFormFieldControl, useExisting: FormFieldWrapperComponent }],
})
export class FormFieldWrapperComponent extends FieldWrapper implements OnInit, OnDestroy, MatFormFieldControl<any> {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(MatFormField) formField: MatFormField;

  placeholder: string;
  shouldPlaceholderFloat: boolean;

  value: any;
  empty: boolean;
  stateChanges = new Subject<void>();

  _errorState = false;
  focused = false;
  get errorState() { return this.showError; }

  get showError() {
    const showError = this.options.showError(this);
    if (showError !== this._errorState) {
      this._errorState = showError;
      this.stateChanges.next();
    }

    return showError;
  }

  get ngControl() { return this.formControl as any; }
  get required() { return this.to.required; }
  get disabled() { return this.to.disabled; }

  private destroy$ = new Subject<void>();

  constructor(private _focusMonitor: FocusMonitor, private ngZone: NgZone, private renderer: Renderer2) {
    super();
  }

  ngOnInit() {
    this.focused = !!this.field.focus;
    this.formField._control = this;
    this.field['__formField__'] = this.formField;
    if (this.to.floatPlaceholder) {
      this.to.floatLabel = this.to.floatPlaceholder;
      console.warn(`${this.field.key}: Passing 'floatPlaceholder' is deprecated, Use 'floatLabel' instead.`);
    }
  }

  focusMonitor(elements = []) {
    elements.map(element => {
      takeUntil.call(
        this._focusMonitor.monitor(element, this.renderer, false),
        this.destroy$,
      ).subscribe(focusOrigin => {
        if (this.focused !== !!focusOrigin) {
          this.ngZone.run(() => {
            this.focused = !!focusOrigin;
            this.stateChanges.next();
          });
        }
      });
    });
  }

  setDescribedByIds(ids: string[]): void { }
  onContainerClick() { }

  ngOnDestroy() {
    delete this.field['__formField__'];
    this.stateChanges.complete();
    this.destroy$.complete();
  }
}
