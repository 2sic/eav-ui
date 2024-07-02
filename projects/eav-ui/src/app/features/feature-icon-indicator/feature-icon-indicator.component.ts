import { Component } from '@angular/core';
import { FeatureComponentBase, FeatureComponentProviders } from '../shared/base-feature.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
  selector: 'app-feature-icon-indicator',
  templateUrl: './feature-icon-indicator.component.html',
  styleUrls: ['./feature-icon-indicator.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
  providers: [
    ...FeatureComponentProviders,
  ],
})
export class FeatureIconIndicatorComponent extends FeatureComponentBase { }
