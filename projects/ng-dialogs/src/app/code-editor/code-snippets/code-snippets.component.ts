import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';
import { SnippetsSets } from '../models/snippet.model';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss'],
})
export class CodeSnippetsComponent {
  @Input() snippets: SnippetsSets;
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
    GeneralHelpers.toggleInArray(key, this.toggledSections);
  }

  toggleFolder(key: string): void {
    GeneralHelpers.toggleInArray(key, this.toggledFolders);
  }

  toggleInfo(key: string): void {
    GeneralHelpers.toggleInArray(key, this.toggledInfos);
  }

  toggleMore(key: string): void {
    GeneralHelpers.toggleInArray(key, this.toggledMores);
  }
}
