import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';
import { TreeItem } from '../models/tree-item.model';
import { calculateTree } from './code-templates.helpers';

@Component({
  selector: 'app-code-templates',
  templateUrl: './code-templates.component.html',
  styleUrls: ['./code-templates.component.scss'],
})
export class CodeTemplatesComponent implements OnChanges {
  @Input() filename: string;
  @Input() templates: string[];
  @Output() openView: EventEmitter<string> = new EventEmitter();
  @Output() createTemplate: EventEmitter<string> = new EventEmitter();
  tree: TreeItem[];
  toggledItems: string[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.templates != null) {
      this.tree = calculateTree(this.templates ?? []);
    }
    if (changes.filename != null) {
      const previousFilename = changes.filename.previousValue;
      if (previousFilename) {
        this.toggleItem(previousFilename);
      }
      if (this.filename) {
        this.showFileInTree(this.filename);
      }
    }
  }

  openTemplate(path: string): void {
    this.openView.emit(path);
  }

  toggleItem(path: string): void {
    GeneralHelpers.toggleInArray(path, this.toggledItems);
  }

  addFile(folder?: string): void {
    this.createTemplate.emit(folder);
  }

  private showFileInTree(file: string): void {
    if (file == null) { return; }
    if (this.toggledItems.includes(file)) { return; }

    const paths = file.split('/');
    let pathFromRoot = '';
    for (const path of paths) {
      pathFromRoot = !pathFromRoot ? path : `${pathFromRoot}/${path}`;
      if (this.toggledItems.includes(pathFromRoot)) { continue; }
      this.toggleItem(pathFromRoot);
    }
  }
}
