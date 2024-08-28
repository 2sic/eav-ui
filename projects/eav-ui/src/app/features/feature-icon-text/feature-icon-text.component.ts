import { Component } from '@angular/core';
import { FeatureComponentBase } from '../shared/base-feature.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
  selector: 'app-feature-icon-text',
  templateUrl: './feature-icon-text.component.html',
  styleUrls: ['./feature-icon-text.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class FeatureIconTextComponent extends FeatureComponentBase { }
