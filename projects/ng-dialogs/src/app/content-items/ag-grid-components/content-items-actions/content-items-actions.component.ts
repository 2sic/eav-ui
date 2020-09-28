import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { openMoreMenu } from '../../../shared/helpers/open-more-menu.helper';
import { ContentItem } from '../../models/content-item.model';
import { ContentItemsActionsParams } from './content-items-actions.models';

@Component({
  selector: 'app-content-items-actions',
  templateUrl: './content-items-actions.component.html',
  styleUrls: ['./content-items-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentItemsActionsComponent implements ICellRendererAngularComp {
  private params: ContentItemsActionsParams;
  private item: ContentItem;
  private moreDialogRef: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private viewContainerRef: ViewContainerRef) { }

  agInit(params: ContentItemsActionsParams) {
    this.params = params;
    this.item = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  clone() {
    this.params.onClone(this.item);
  }

  export() {
    this.params.onExport(this.item);
  }

  openMoreDialog(templateRef: TemplateRef<any>, buttons: number) {
    this.moreDialogRef = openMoreMenu(templateRef, buttons, this.dialog, this.viewContainerRef);
  }

  deleteItem() {
    this.params.onDelete(this.item);
    this.moreDialogRef.close();
  }
}
