import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ux-help-info-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './ux-help-info-card.component.html',
  styleUrl: './ux-help-info-card.component.scss'
})
export class UxHelpInfoCardComponent {
  description = input.required<string>();
  hint = input.required<string>();
}
