import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class FeatureIconComponent extends FeatureComponentBase { }
