import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';

@Component({
  selector: 'app-picker-help',
  standalone: true,
  imports: [
    MatIconModule,
    TippyDirective,
    ClickStopPropagationDirective,
  ],
  templateUrl: './picker-icon-help.component.html',
})
export class PickerIconHelpComponent {
  @Input() helpLink: string;

  goToLink(): void {
    window.open(this.helpLink, '_blank');
  }
}
