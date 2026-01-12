import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { computedObj } from '../../shared/signals/signal.utilities';
import { FeatureComponentBase } from '../shared/base-feature';

@Component({
  selector: 'app-feature-text-info',
  templateUrl: './feature-text-info.html',
  styleUrls: ['./feature-text-info.scss'],
  imports: [
    MatIconModule,
    TranslateModule,
    TippyDirective,
  ]
})
export class FeatureTextInfoComponent extends FeatureComponentBase {
  asInfo = input<boolean>(false);

  constructor() {
    super();
  }

  icon = computedObj('icon', () => this.asInfo() ? 'info' : 'warning');
}
