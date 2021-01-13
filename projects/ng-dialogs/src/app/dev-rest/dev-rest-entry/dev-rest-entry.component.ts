import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dev-rest-entry',
  templateUrl: './dev-rest-entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestEntryComponent {
  constructor() { }
}
