import { KeyValuePipe } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ArrayHelpers } from '../../shared/helpers/array.helpers';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { SnippetsSets } from '../models/snippet.model';
import { ObjectToArrayPipe } from './object-to-array.pipe';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatRippleModule,
    KeyValuePipe,
    TranslateModule,
    ObjectToArrayPipe,
    ClickStopPropagationDirective,
    TippyDirective,
    SafeHtmlPipe,
  ],
})
export class CodeSnippetsComponent {
  snippets = input<SnippetsSets>();
  @Output() insertSnippet: EventEmitter<string> = new EventEmitter();
  toggledSections: string[] = [];
  toggledFolders: string[] = [];
  toggledInfos: string[] = [];
  toggledMores: string[] = [];

  constructor() { }

  addSnippet(snippet: string): void {
    this.insertSnippet.emit(snippet);
  }

  toggleSection(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledSections);
  }

  toggleFolder(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledFolders);
  }

  toggleInfo(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledInfos);
  }

  toggleMore(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledMores);
  }
}
