import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-dev-rest-entry',
    templateUrl: './entry.html',
    imports: [RouterOutlet]
})
export class DevRestEntryComponent {
  constructor() { }
}
