import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GeneralHelpers } from '../../edit/shared/helpers';
import { ViewKey } from '../code-editor.models';
import { FileAsset } from '../models/file-asset.model';
import { SourceView } from '../models/source-view.model';
import { TreeItem } from '../models/tree-item.model';
import { calculateTreeAppShared } from './code-templates.helpers';
import { appSharedRoot, CreateTemplateParams } from './code-templates.models';
import { SortItemsPipe } from './order-items.pipe';
import { DepthPaddingPipe } from './depth-padding.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { NgTemplateOutlet, NgClass } from '@angular/common';

@Component({
    selector: 'app-code-templates',
    templateUrl: './code-templates.component.html',
    styleUrls: ['./code-templates.component.scss'],
    standalone: true,
    imports: [
        NgTemplateOutlet,
        NgClass,
        SharedComponentsModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        DepthPaddingPipe,
        SortItemsPipe,
    ],
})
export class CodeTemplatesComponent implements OnChanges {
  @Input() view?: SourceView;
  @Input() templates: FileAsset[];
  @Output() openView: EventEmitter<ViewKey> = new EventEmitter();
  @Output() createTemplate: EventEmitter<CreateTemplateParams> = new EventEmitter();
  tree: TreeItem[];
  toggledItemsApp: string[] = [];
  toggledItemsShared: string[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.templates != null) {
      this.tree = calculateTreeAppShared(this.templates);
    }
    if (changes.view != null) {
      const previousView: SourceView = changes.view?.previousValue;
      if (previousView) {
        this.toggleItem(previousView.FileName, previousView.IsShared);
      }
      if (this.view) {
        this.showFileInTree(this.view.FileName, this.view.IsShared);
      }
    }
  }

  isToggled(path: string, isShared: boolean): boolean {
    const toggledItems = isShared ? this.toggledItemsShared : this.toggledItemsApp;
    return toggledItems.includes(path);
  }

  openTemplate(path: string, isShared: boolean): void {
    const viewKey: ViewKey = { key: path, shared: isShared };
    this.openView.emit(viewKey);
  }

  toggleItem(path: string, isShared: boolean): void {
    const toggledItems = isShared ? this.toggledItemsShared : this.toggledItemsApp;
    GeneralHelpers.toggleInArray(path, toggledItems);
  }

  addFile(folder?: string, isShared?: boolean): void {
    const params: CreateTemplateParams = { folder, isShared };
    this.createTemplate.emit(params);
  }

  private showFileInTree(file: string, isShared: boolean): void {
    if (file == null) { return; }
    const toggledItems = isShared ? this.toggledItemsShared : this.toggledItemsApp;
    if (toggledItems.includes(file)) { return; }

    const paths = [appSharedRoot, ...file.split('/')];
    let pathFromRoot = '';
    for (const path of paths) {
      pathFromRoot = !pathFromRoot ? path : `${pathFromRoot}/${path}`;
      if (toggledItems.includes(pathFromRoot)) { continue; }
      this.toggleItem(pathFromRoot, isShared);
    }
  }
}
