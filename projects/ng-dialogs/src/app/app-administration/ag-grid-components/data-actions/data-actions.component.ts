import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { openMoreMenu } from '../../../shared/helpers/open-more-menu.helper';
import { ContentType } from '../../models/content-type.model';
import { DataActionsParams } from './data-actions.models';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  styleUrls: ['./data-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataActionsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  enablePermissions: boolean;
  private params: DataActionsParams;
  private moreDialogRef: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private viewContainerRef: ViewContainerRef) { }

  agInit(params: DataActionsParams) {
    this.params = params;
    this.contentType = this.params.data;
    const enablePermissions = this.params.enablePermissionsGetter();
    this.enablePermissions = enablePermissions && this.isGuid(this.contentType.StaticName);
  }

  refresh(params?: any): boolean {
    return true;
  }

  createOrEditMetadata() {
    this.params.onCreateOrEditMetadata(this.contentType);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.contentType);
  }

  openMoreDialog(templateRef: TemplateRef<any>, buttons: number) {
    this.moreDialogRef = openMoreMenu(templateRef, buttons, this.dialog, this.viewContainerRef);
    this.moreDialogRef.afterClosed().pipe(take(1)).subscribe(() => { this.moreDialogRef = null; });
  }

  openExport() {
    this.params.onOpenExport(this.contentType);
    this.moreDialogRef.close();
  }

  openImport() {
    this.params.onOpenImport(this.contentType);
    this.moreDialogRef.close();
  }

  deleteContentType() {
    this.params.onDelete(this.contentType);
    this.moreDialogRef.close();
  }

  private isGuid(txtToTest: string) {
    const patt = new RegExp(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i);
    return patt.test(txtToTest);
  }
}
