import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { TippyStandaloneDirective } from 'projects/eav-ui/src/app/shared/directives/tippy-Standalone.directive';

@Component({
  selector: 'app-picker-help',
  standalone: true,
  imports: [
    MatIconModule,
    TippyStandaloneDirective,
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
