import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-empty-route',
  templateUrl: './empty-route.component.html',
})
export class EmptyRouteComponent {
  production: boolean;

  constructor() {
    this.production = environment.production;
  }
}
