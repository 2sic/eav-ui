import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';

@Component({
    selector: 'app-picker-icon-info',
    imports: [
        MatIconModule,
        TippyDirective,
        ClickStopPropagationDirective,
    ],
    templateUrl: './picker-icon-info.html'
})
export class PickerIconInfoComponent {
  infoBox = input<string>();
}
