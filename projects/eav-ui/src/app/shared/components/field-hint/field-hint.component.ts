import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-field-hint',
  templateUrl: './field-hint.component.html',
  styleUrls: ['./field-hint.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule, NgClass
  ]
})
export class FieldHintComponent {
  @Input() isError = false;
  isShort = true;

  constructor() { }

  toggleIsShort() {
    this.isShort = !this.isShort;
  }
}
