import { Directive, Input } from "@angular/core";
import { MatBadge } from "@angular/material/badge";

@Directive({
  selector: '[matBadgeIcon]',
})
export class MatBadgeIconDirective extends MatBadge {
  @Input() matBadgeIcon: string = '';

  constructor() {
    super();
  }
}