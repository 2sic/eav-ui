import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

import { toggleInArray } from './code-snippets.helpers';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeSnippetsComponent implements OnInit {
  @Input() snippets: any;
  @Output() insertSnippet: EventEmitter<any> = new EventEmitter();
  toggledSections: any[] = [];
  toggledFolders: any[] = [];
  toggledInfos: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  addSnippet(snippet: string) {
    this.insertSnippet.emit(snippet);
  }

  toggleSection(set: any) {
    toggleInArray(set, this.toggledSections);
  }

  toggleFolder(item: any) {
    toggleInArray(item, this.toggledFolders);
  }

  toggleInfo(info: any) {
    toggleInArray(info, this.toggledInfos);
  }

}
