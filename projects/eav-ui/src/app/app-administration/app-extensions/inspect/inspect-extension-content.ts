import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ExtensionInspectResult } from '../extension.model';

@Component({
  selector: 'app-inspect-extension',
  templateUrl: './inspect-extension.html',
  styleUrls: ['./inspect-extension.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatExpansionModule,
  ]
})
export class InspectExtensionComponent {
  data = input.required<ExtensionInspectResult | undefined>();
}
