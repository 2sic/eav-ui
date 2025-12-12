import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';

@Component({
    selector: 'app-picker-help',
    imports: [
        MatIconModule,
        TippyDirective,
        ClickStopPropagationDirective,
    ],
    templateUrl: './picker-icon-help.html'
})
export class PickerIconHelpComponent {
  helpLink = input<string>();

  goToLink(): void {
    window.open(this.helpLink(), '_blank');
  }
}
