import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ExtensionInspectResult } from '../../../models/extension.model';

@Component({
  selector: 'app-inspect-extension-content',
  templateUrl: './inspect-extension-content.html',
  styleUrls: ['./inspect-extension-content.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatExpansionModule,
  ]
})
export class InspectExtensionContentComponent {
  data = input.required<ExtensionInspectResult | undefined>();
}
