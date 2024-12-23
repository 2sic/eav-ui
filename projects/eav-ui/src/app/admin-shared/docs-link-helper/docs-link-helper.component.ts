import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
    selector: 'app-docs-link-helper',
    imports: [
        MatIconModule,
        MatButtonModule,
        TippyDirective,
    ],
    template: `
  <a mat-button class="eav-button__with-icon" href="{{ link() }}" target="_blank" tippy="online documentation">
    <mat-icon mat-icon class="eav-icon">{{ icon() ?? 'menu_book' }}</mat-icon>
    <span>{{ label() }}</span>
  </a>
`
})
export class DocsLinkHelperComponent {
  link = input<string>();   
  label = input<string>();
  icon = input<string>();
}
