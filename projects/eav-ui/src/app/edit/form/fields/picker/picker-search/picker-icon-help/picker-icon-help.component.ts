import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyStandaloneDirective } from 'projects/eav-ui/src/app/shared/directives/tippy-Standalone.directive';

@Component({
  selector: 'app-picker-help',
  standalone: true,
  imports: [
    MatIconModule,
    TippyStandaloneDirective
  ],
  templateUrl: './picker-icon-help.component.html',
})
export class PickerIconHelpComponent {
  @Input() helpLink: string;

  goToLink(): void {
    window.open(this.helpLink, '_blank');
  }
}
