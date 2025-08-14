import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ExtendedFabSpeedDialImports } from '../modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';

@Component({
  selector: 'app-save-close-button',
  imports: [
    NgClass,
    MatIconModule,
    ...ExtendedFabSpeedDialImports,
    MatRippleModule,
    TranslateModule,
  ],
  templateUrl: './save-close-button.component.html',
  styleUrl: './save-close-button.component.scss'
})
export class SaveCloseButtonComponent {
  @Input() canSave: boolean | string = false;
  @Input() saveDisabled!: () => boolean;
  @Output() saveAll = new EventEmitter<boolean>();
}
