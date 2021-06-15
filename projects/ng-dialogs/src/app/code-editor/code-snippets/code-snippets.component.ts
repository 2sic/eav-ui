import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss'],
})
export class CodeSnippetsComponent implements OnInit {
  @Input() snippets: any;
  @Output() insertSnippet: EventEmitter<any> = new EventEmitter();
  toggledSections: any[] = [];
  toggledFolders: any[] = [];
  toggledInfos: any[] = [];
  toggledMores: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  addSnippet(snippet: string) {
    this.insertSnippet.emit(snippet);
  }

  toggleSection(set: any) {
    GeneralHelpers.toggleInArray(set, this.toggledSections);
  }

  toggleFolder(item: any) {
    GeneralHelpers.toggleInArray(item, this.toggledFolders);
  }

  toggleInfo(info: any) {
    GeneralHelpers.toggleInArray(info, this.toggledInfos);
  }

  toggleMore(more: any) {
    GeneralHelpers.toggleInArray(more, this.toggledMores);
  }

}
