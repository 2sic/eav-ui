import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeatureComponentBase } from '../shared/feature-component-base';

@Component({
  selector: 'app-feature-icon-with-dialog',
  templateUrl: './feature-icon-with-dialog.html',
  styleUrls: ['./feature-icon-with-dialog.scss'],
  imports: [
    MatIconModule,
    TippyDirective,
  ]
})
export class FeatureIconWithDialogComponent extends FeatureComponentBase {

  /**
   * Determine if styling should be optimized to use the indictor inline with text.
   */
  forText = input<boolean>(false);
}
