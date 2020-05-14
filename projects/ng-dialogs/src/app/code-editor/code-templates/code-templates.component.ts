import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { SourceView } from '../models/source-view.model';
import { DialogService } from '../../shared/services/dialog.service';
import { calculateTree, toggleInArray, calculateOpenItems } from './code-templates.helpers';
import { TreeItem } from '../models/tree-item.model';

@Component({
  selector: 'app-code-templates',
  templateUrl: './code-templates.component.html',
  styleUrls: ['./code-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeTemplatesComponent implements OnInit, OnChanges {
  @Input() view: SourceView;
  @Input() templates: string[];
  @Output() createTemplate: EventEmitter<null> = new EventEmitter();
  tree: TreeItem[];
  toggledItems: TreeItem[] = [];

  constructor(private dialogService: DialogService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.templates?.currentValue) {
      this.tree = calculateTree(this.templates);
      this.toggledItems = calculateOpenItems(this.view?.FileName, this.tree);
    }
    if (changes.view?.currentValue) {
      this.toggledItems = calculateOpenItems(this.view?.FileName, this.tree);
    }
  }

  openTemplate(path: string) {
    this.dialogService.openCodeFile(path);
  }

  toggleItem(item: TreeItem) {
    toggleInArray(item, this.toggledItems);
  }

  addFile() {
    this.createTemplate.emit();
  }

}
