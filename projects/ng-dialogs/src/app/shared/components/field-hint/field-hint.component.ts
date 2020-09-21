import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-field-hint',
  templateUrl: './field-hint.component.html',
  styleUrls: ['./field-hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldHintComponent {
  @Input() isError = false;
  isShort = true;

  constructor() { }

  toggleIsShort() {
    this.isShort = !this.isShort;
  }
}
