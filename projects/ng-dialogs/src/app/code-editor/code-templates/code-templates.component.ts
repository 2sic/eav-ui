import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';
import { DialogService } from '../../shared/services/dialog.service';
import { SourceView } from '../models/source-view.model';
import { TreeItem } from '../models/tree-item.model';
import { calculateTree } from './code-templates.helpers';

@Component({
  selector: 'app-code-templates',
  templateUrl: './code-templates.component.html',
  styleUrls: ['./code-templates.component.scss'],
})
export class CodeTemplatesComponent implements OnChanges {
  @Input() view: SourceView;
  @Input() templates: string[];
  @Output() createTemplate: EventEmitter<string> = new EventEmitter();
  tree: TreeItem[];
  toggledItems: string[] = [];

  constructor(private dialogService: DialogService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.templates?.currentValue) {
      this.tree = calculateTree(this.templates);
    }
    if (changes.view?.currentValue) {
      this.showFileInTree(this.view.FileName);
    }
  }

  openTemplate(path: string): void {
    this.dialogService.openCodeFile(path);
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
