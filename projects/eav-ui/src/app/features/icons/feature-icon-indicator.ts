import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeatureComponentBase } from '../shared/feature-component-base';

@Component({
  selector: 'app-feature-icon-indicator',
  templateUrl: './feature-icon-indicator.html',
  imports: [
    MatIconModule,
    TippyDirective,
  ]
})
export class FeatureIconIndicatorComponent extends FeatureComponentBase { }
