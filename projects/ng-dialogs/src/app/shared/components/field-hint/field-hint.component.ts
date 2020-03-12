import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-field-hint',
  templateUrl: './field-hint.component.html',
  styleUrls: ['./field-hint.component.scss']
})
export class FieldHintComponent implements OnChanges {
  @Input() text: string;
  @Input() resetOnChange = true;
  isShort = true;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.resetOnChange) { return; }
    if (changes.text) {
      this.isShort = true;
    }
  }

  toggleIsShort() {
    this.isShort = !this.isShort;
  }
}
