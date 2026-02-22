import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { computedObj } from '../../shared/signals/signal.utilities';
import { FeatureComponentBase } from '../shared/feature-component-base';

@Component({
  selector: 'app-feature-info-box',
  templateUrl: './feature-info-box.html',
  styleUrls: ['./feature-info-box.scss'],
  imports: [
    MatIconModule,
    TranslateModule,
    TippyDirective,
  ]
})
export class FeatureInfoBoxComponent extends FeatureComponentBase {

  /**
   * Just indicate that this is an info, not a warning - so it can be styled differently if needed.
   */
  asInfo = input<boolean>(false);

  /**
   * Change the icon based on if this is info or warning, so it can be styled differently if needed.
   */
  icon = computedObj('icon', () => this.asInfo() ? 'info' : 'warning');
}
