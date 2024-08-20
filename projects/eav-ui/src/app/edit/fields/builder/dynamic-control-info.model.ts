import { ComponentRef, ViewContainerRef } from '@angular/core';
import { InjectorBundle } from './injector-bundle.model';

export class DynamicControlInfo {
  constructor(
    public wrapperRef: ComponentRef<any>,
    public contentsRef: ViewContainerRef,
    // will only need to be set the first time
    public injectors: InjectorBundle,
  ) { }
}
