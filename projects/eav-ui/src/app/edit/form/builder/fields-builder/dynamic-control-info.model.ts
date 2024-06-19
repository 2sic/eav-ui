import { ComponentRef, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from './field-wrapper.model';
import { InjectorBundle } from './injector-bundle.model';

export class DynamicControlInfo {
  constructor(
    public wrapperRef: ComponentRef<FieldWrapper>,
    public contentsRef: ViewContainerRef,
    // will only need to be set the first time
    public injectors: InjectorBundle = null
  ) { }
}
