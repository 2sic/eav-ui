import { Directive, TemplateRef } from '@angular/core';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[extendedFabSpeedDialTriggerContent]' })
export class ExtendedFabSpeedDialTriggerContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) { }
}
