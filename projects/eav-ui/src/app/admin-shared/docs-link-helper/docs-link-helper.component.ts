import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
  selector: 'app-docs-link-helper',
  templateUrl: './docs-link-helper.component.html',
  styleUrls: ['./docs-link-helper.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    TippyDirective,
  ],
})
export class DocsLinkHelperComponent {
  link = input<string>();
  label = input<string>();
  icon = input<string>();
}