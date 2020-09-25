import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { openMoreMenu } from '../../../shared/helpers/open-more-menu.helper';
import { Query } from '../../models/query.model';
import { QueriesActionsParams } from './queries-actions.models';

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.component.html',
  styleUrls: ['./queries-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesActionsComponent implements ICellRendererAngularComp {
  enablePermissions: boolean;
  private params: QueriesActionsParams;
  private moreDialogRef: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private viewContainerRef: ViewContainerRef) { }

  agInit(params: QueriesActionsParams) {
    this.params = params;
    this.enablePermissions = this.params.enablePermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  editQuery() {
    const query: Query = this.params.data;
    this.params.onEditQuery(query);
  }

  openPermissions() {
    const query: Query = this.params.data;
    this.params.onOpenPermissions(query);
  }

  openMoreDialog(templateRef: TemplateRef<any>, buttons: number) {
    this.moreDialogRef = openMoreMenu(templateRef, buttons, this.dialog, this.viewContainerRef);
  }

  cloneQuery() {
    const query: Query = this.params.data;
    this.params.onCloneQuery(query);
    this.moreDialogRef.close();
    this.moreDialogRef = null;
  }

  exportQuery() {
    const query: Query = this.params.data;
    this.params.onExportQuery(query);
    this.moreDialogRef.close();
    this.moreDialogRef = null;
  }

  deleteQuery() {
    const query: Query = this.params.data;
    this.params.onDelete(query);
    this.moreDialogRef.close();
    this.moreDialogRef = null;
  }
}
