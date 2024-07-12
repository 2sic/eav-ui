import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

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
