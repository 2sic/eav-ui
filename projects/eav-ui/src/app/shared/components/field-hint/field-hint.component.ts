import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-field-hint',
    templateUrl: './field-hint.component.html',
    styleUrls: ['./field-hint.component.scss'],
    imports: [
        MatFormFieldModule,
        NgClass,
        NgTemplateOutlet
    ]
})
export class FieldHintComponent {
  isError = input<boolean>(false);
  isShort = true;

  constructor() { }

  toggleIsShort() {
    this.isShort = !this.isShort;
  }
}
