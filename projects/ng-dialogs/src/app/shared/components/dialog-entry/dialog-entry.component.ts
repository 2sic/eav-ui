import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

// tslint:disable-next-line:max-line-length
import { APPS_MANAGEMENT_DIALOG, IMPORT_APP_DIALOG, APP_ADMINISTRATION_DIALOG, CODE_EDITOR_DIALOG, EDIT_CONTENT_TYPE_DIALOG, CONTENT_TYPE_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, EDIT_CONTENT_TYPE_FIELDS_DIALOG, ITEMS_EDIT_DIALOG, IMPORT_QUERY_DIALOG, CONTENT_ITEMS_DIALOG, IMPORT_CONTENT_ITEM_DIALOG, EXPORT_APP, EXPORT_APP_PARTS, IMPORT_APP_PARTS } from '../../constants/dialog-names';
import { Context } from '../../context/context';
import { AppsManagementNavComponent } from '../../../apps-management/apps-management-nav/apps-management-nav.component';
import { ImportAppComponent } from '../../../apps-management/shared/modals/import-app/import-app.component';
import { AppAdministrationNavComponent } from '../../../app-administration/app-administration-nav/app-administration-nav.component';
import { CodeEditorComponent } from '../../../code-editor/code-editor/code-editor.component';
import { EditContentTypeComponent } from '../../../app-administration/shared/modals/edit-content-type/edit-content-type.component';
import { DialogService } from '../dialog-service/dialog.service';
import { ClosedDialogData } from '../../models/closed-dialog.model';
import { ContentTypeFieldsComponent } from '../../../app-administration/shared/modals/content-type-fields/content-type-fields.component';
import { ContentExportComponent } from '../../../app-administration/shared/modals/content-export/content-export.component';
import { ContentImportComponent } from '../../../app-administration/shared/modals/content-import/content-import.component';
import { PermissionsComponent } from '../../../app-administration/shared/modals/permissions/permissions.component';
// tslint:disable-next-line:max-line-length
import { EditContentTypeFieldsComponent } from '../../../app-administration/shared/modals/edit-content-type-fields/edit-content-type-fields.component';
import { MultiItemEditFormComponent } from '../../../../../../edit/eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';
import { ImportQueryComponent } from '../../../app-administration/shared/modals/import-query/import-query.component';
import { ContentItemsComponent } from '../../../app-administration/shared/modals/content-items/content-items.component';
import { ContentItemImportComponent } from '../../../app-administration/shared/modals/content-item-import/content-item-import.component';
import { ExportAppComponent } from '../../../app-administration/shared/modals/export-app/export-app.component';
import { ExportAppPartsComponent } from '../../../app-administration/shared/modals/export-app-parts/export-app-parts.component';
import { ImportAppPartsComponent } from '../../../app-administration/shared/modals/import-app-parts/import-app-parts.component';

@Component({
  selector: 'app-dialog-entry',
  templateUrl: './dialog-entry.component.html',
  styleUrls: ['./dialog-entry.component.scss']
})
export class DialogEntryComponent implements OnInit, OnDestroy {
  production: boolean;

  private subscription = new Subscription();
  private dialogRef: MatDialogRef<any, any>;
  private dialogName: string;
  private component: any;
  private panelSize: 'small' | 'medium' | 'large' | 'fullscreen' | 'custom'; // has to match css
  private panelClass: string[] = [];

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private dialogService: DialogService,
  ) {
    this.production = environment.production;
    this.configureDialog();
  }

  ngOnInit() {
    console.log('Open dialog:', this.dialogName, 'Context id:', this.context.id, 'Context:', this.context);

    this.dialogRef = this.dialog.open(this.component, {
      backdropClass: 'dialog-backdrop',
      panelClass: ['dialog-panel', `dialog-panel-${this.panelSize}`, ...this.panelClass],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      // spm NOTE: used to force align-items: flex-start; on cdk-global-overlay-wrapper.
      // Real top margin is overwritten in css e.g. dialog-panel-large
      position: { top: '0' }
    });

    this.subscription.add(
      this.dialogRef.afterClosed().subscribe((data: ClosedDialogData) => {
        this.dialogService.fireClosed(this.dialogName, data);

        if (this.route.pathFromRoot.length <= 3) {
          try {
            (window.parent as any).$2sxc.totalPopup.close();
          } catch (error) { }
          return;
        }

        if (this.route.snapshot.url.length > 0) {
          this.router.navigate(['./'], { relativeTo: this.route.parent });
        } else {
          this.router.navigate(['./'], { relativeTo: this.route.parent.parent });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
    this.component = null;
    this.dialogRef.close();
    this.dialogRef = null;
  }

  private configureDialog() {
    this.dialogName = this.route.snapshot.data.dialogName;
    if (!this.dialogName) {
      throw new Error(`Could not find dialog type: ${this.dialogName}. Did you forget to add dialogName to route data?`);
    }

    switch (this.dialogName) {
      case APPS_MANAGEMENT_DIALOG:
        // this is module root dialog and has to init context
        this.component = AppsManagementNavComponent;
        this.panelSize = 'large';
        this.context.init(this.route);
        break;
      case IMPORT_APP_DIALOG:
        this.component = ImportAppComponent;
        this.panelSize = 'medium';
        break;

      case APP_ADMINISTRATION_DIALOG:
        // this is module root dialog and has to init context
        this.component = AppAdministrationNavComponent;
        this.panelSize = 'large';
        this.context.init(this.route);
        break;
      case CONTENT_ITEMS_DIALOG:
        this.component = ContentItemsComponent;
        this.panelSize = 'large';
        break;
      case IMPORT_CONTENT_ITEM_DIALOG:
        this.component = ContentItemImportComponent;
        this.panelSize = 'medium';
        break;
      case EDIT_CONTENT_TYPE_DIALOG:
        this.component = EditContentTypeComponent;
        this.panelSize = 'small';
        break;
      case CONTENT_TYPE_FIELDS_DIALOG:
        this.component = ContentTypeFieldsComponent;
        this.panelSize = 'large';
        break;
      case EDIT_CONTENT_TYPE_FIELDS_DIALOG:
        this.component = EditContentTypeFieldsComponent;
        this.panelSize = 'medium';
        break;
      case EXPORT_CONTENT_TYPE_DIALOG:
        this.component = ContentExportComponent;
        this.panelSize = 'medium';
        break;
      case IMPORT_CONTENT_TYPE_DIALOG:
        this.component = ContentImportComponent;
        this.panelSize = 'medium';
        break;
      case SET_PERMISSIONS_DIALOG:
        this.component = PermissionsComponent;
        this.panelSize = 'large';
        break;
      case IMPORT_QUERY_DIALOG:
        this.component = ImportQueryComponent;
        this.panelSize = 'medium';
        break;
      case EXPORT_APP:
        this.component = ExportAppComponent;
        this.panelSize = 'medium';
        break;
      case EXPORT_APP_PARTS:
        this.component = ExportAppPartsComponent;
        this.panelSize = 'medium';
        break;
      case IMPORT_APP_PARTS:
        this.component = ImportAppPartsComponent;
        this.panelSize = 'medium';
        break;

      case CODE_EDITOR_DIALOG:
        // this is module root dialog and has to init context
        this.component = CodeEditorComponent;
        this.panelSize = 'fullscreen';
        this.context.init(this.route);
        break;

      case ITEMS_EDIT_DIALOG:
        // this is module root dialog and has to init context
        this.component = MultiItemEditFormComponent;
        this.panelSize = 'custom';
        this.panelClass = ['c-multi-item-dialog'];
        this.context.init(this.route);
        break;
      default:
        throw new Error(`This Dialog was not configured: ${this.dialogName}.`);
    }
  }

}
