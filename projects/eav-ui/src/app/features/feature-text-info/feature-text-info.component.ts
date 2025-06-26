import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { computedObj } from '../../shared/signals/signal.utilities';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-text-info',
  templateUrl: './feature-text-info.component.html',
  styleUrls: ['./feature-text-info.component.scss'],
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

    console.log("2dg", this.asInfo())
  }

  icon = computedObj('icon', () => this.asInfo() ? 'info' : 'warning');
}
