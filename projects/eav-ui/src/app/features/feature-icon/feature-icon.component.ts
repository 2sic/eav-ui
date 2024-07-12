import { Component } from '@angular/core';
import { FeatureComponentBase, FeatureComponentProviders } from '../shared/base-feature.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss'],
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
export class FeatureIconComponent extends FeatureComponentBase { }
