import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

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
