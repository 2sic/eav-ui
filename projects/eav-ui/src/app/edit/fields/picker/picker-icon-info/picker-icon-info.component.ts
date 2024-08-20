import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';

@Component({
  selector: 'app-picker-icon-info',
  standalone: true,
  imports: [
    MatIconModule,
    TippyDirective,
    ClickStopPropagationDirective,
  ],
  templateUrl: './picker-icon-info.component.html',
})
export class PickerIconInfoComponent {
  @Input() infoBox: string;
}
