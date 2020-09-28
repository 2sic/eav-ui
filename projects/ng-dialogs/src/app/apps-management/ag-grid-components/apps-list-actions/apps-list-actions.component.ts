import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { openMoreMenu } from '../../../shared/helpers/open-more-menu.helper';
import { App } from '../../models/app.model';
import { AppsListActionsParams } from './apps-list-actions.models';

@Component({
  selector: 'app-apps-list-actions',
  templateUrl: './apps-list-actions.component.html',
  styleUrls: ['./apps-list-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsListActionsComponent implements ICellRendererAngularComp {
  app: App;
  private params: AppsListActionsParams;
  private moreDialogRef: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private viewContainerRef: ViewContainerRef) { }

  agInit(params: AppsListActionsParams) {
    this.params = params;
    this.app = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  flushCache() {
    this.params.onFlush(this.app);
  }

  openMoreDialog(templateRef: TemplateRef<any>, buttons: number) {
    this.moreDialogRef = openMoreMenu(templateRef, buttons, this.dialog, this.viewContainerRef);
  }

  deleteApp() {
    this.params.onDelete(this.app);
    this.moreDialogRef.close();
  }
}
