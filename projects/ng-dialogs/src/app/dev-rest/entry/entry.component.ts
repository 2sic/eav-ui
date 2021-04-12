import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dev-rest-entry',
  templateUrl: './entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestEntryComponent {
  constructor() { }
}
