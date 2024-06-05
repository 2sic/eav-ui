import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-empty-route',
  templateUrl: './empty-route.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class EmptyRouteComponent {
  constructor() { }
}
