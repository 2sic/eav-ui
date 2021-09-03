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
  toggledSections: any[] = [];
  toggledFolders: any[] = [];
  toggledInfos: any[] = [];
  toggledMores: any[] = [];

  constructor() { }

  addSnippet(snippet: string): void {
    this.insertSnippet.emit(snippet);
  }

  toggleSection(set: any): void {
    GeneralHelpers.toggleInArray(set, this.toggledSections);
  }

  toggleFolder(item: any): void {
    GeneralHelpers.toggleInArray(item, this.toggledFolders);
  }

  toggleInfo(info: any): void {
    GeneralHelpers.toggleInArray(info, this.toggledInfos);
  }

  toggleMore(more: any): void {
    GeneralHelpers.toggleInArray(more, this.toggledMores);
  }
}
