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
  toggled: string[] = [];

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
    this.toggled = [];
  }

  addSnippet(snippet: string) {
    this.insertSnippet.emit(snippet);
  }

  toggleItem(item: any) {
    const index = this.toggled.indexOf(item);
    if (index === -1) {
      this.toggled.push(item);
    } else {
      this.toggled.splice(index, 1);
    }
  }

}
