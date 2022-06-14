import { Directive, TemplateRef } from '@angular/core';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[extendedFabSpeedDialActionsContent]' })
export class ExtendedFabSpeedDialActionsContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) { }
}
