import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyStandaloneDirective } from 'projects/eav-ui/src/app/shared/directives/tippy-Standalone.directive';

@Component({
  selector: 'app-picker-icon-info',
  standalone: true,
  imports: [
    MatIconModule,
    TippyStandaloneDirective
  ],
  templateUrl: './picker-icon-info.component.html',
})
export class PickerIconInfoComponent {
  @Input() infoBox: string;
}
