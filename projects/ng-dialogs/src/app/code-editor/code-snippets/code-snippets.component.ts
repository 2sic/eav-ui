import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeSnippetsComponent implements OnInit, OnChanges {
  @Input() snippets: any;
  @Output() insertSnippet: EventEmitter<any> = new EventEmitter();
  selected = 'Content';
  sets: string[];
  activeSet: any;
  toggledItems: any[] = [];
  toggledInfos: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const snippets = changes.snippets.currentValue;
    if (snippets) {
      this.sets = Object.keys(snippets);
      this.activeSet = this.snippets[this.selected];
    } else {
      this.sets = null;
      this.activeSet = null;
    }
  }

  onSetChange(event: MatSelectChange) {
    this.selected = event.value;
    this.activeSet = this.snippets[this.selected];
    this.toggledItems = [];
    this.toggledInfos = [];
  }

  addSnippet(snippet: string) {
    this.insertSnippet.emit(snippet);
  }

  toggleItem(item: any) {
    this.toggleInArray(item, this.toggledItems);
  }

  toggleInfo(info: any) {
    this.toggleInArray(info, this.toggledInfos);
  }

  private toggleInArray(item: any, array: any[]) {
    const index = array.indexOf(item);
    if (index === -1) {
      array.push(item);
    } else {
      array.splice(index, 1);
    }
  }

}
