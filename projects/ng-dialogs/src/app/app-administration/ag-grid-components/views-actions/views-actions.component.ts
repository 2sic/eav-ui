import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { openMoreMenu } from '../../../shared/helpers/open-more-menu.helper';
import { View } from '../../models/view.model';
import { ViewActionsParams } from './views-actions.models';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  enableCode: boolean;
  enablePermissions: boolean;
  private params: ViewActionsParams;
  private moreDialogRef: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private viewContainerRef: ViewContainerRef) { }

  agInit(params: ViewActionsParams) {
    this.params = params;
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode() {
    const view: View = this.params.data;
    this.params.onOpenCode(view);
  }

  openPermissions() {
    const view: View = this.params.data;
    this.params.onOpenPermissions(view);
  }

  openMoreDialog(templateRef: TemplateRef<any>, buttons: number) {
    this.moreDialogRef = openMoreMenu(templateRef, buttons, this.dialog, this.viewContainerRef);
  }

  deleteView() {
    const view: View = this.params.data;
    this.params.onDelete(view);
    this.moreDialogRef.close();
    this.moreDialogRef = null;
  }
}
