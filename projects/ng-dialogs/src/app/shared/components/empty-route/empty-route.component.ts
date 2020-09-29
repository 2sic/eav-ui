import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-empty-route',
  templateUrl: './empty-route.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyRouteComponent {
  constructor() { }
}
