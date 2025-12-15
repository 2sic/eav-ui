import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from '../../directives/tippy.directive';
import { ExtendedFabSpeedDialImports } from '../extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { SaveCloseButtonBase } from './save-close-button-base.directive';

@Component({
  selector: 'app-save-close-button',
  imports: [
    NgClass,
    MatIconModule,
    ...ExtendedFabSpeedDialImports,
    MatRippleModule,
    TranslateModule,
    TippyDirective,
  ],
  templateUrl: './save-close-button.html',
  styleUrls: ['./save-close-button.scss'],
})
export class SaveCloseButtonComponent extends SaveCloseButtonBase {}