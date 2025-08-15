import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ExtendedFabSpeedDialImports } from '../extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { SaveCloseButtonBase } from '../save-close-button/save-close-button-base.directive';

@Component({
  selector: 'app-save-close-button-fab',
  imports: [
    NgClass,
    MatIconModule,
    ...ExtendedFabSpeedDialImports,
    MatRippleModule,
    TranslateModule,
  ],
  templateUrl: './save-close-button-fab.component.html',
  styleUrls: ['./save-close-button-fab.component.scss'],
})
export class SaveCloseButtonFabComponent extends SaveCloseButtonBase {}