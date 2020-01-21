import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

// tslint:disable-next-line:max-line-length
import { APPS_MANAGEMENT_DIALOG, IMPORT_APP_DIALOG, ENABLE_LANGUAGES_DIALOG, APP_ADMINISTRATION_DIALOG, CODE_EDITOR_DIALOG, ADD_CONTENT_TYPE_DIALOG, EDIT_CONTENT_TYPE_DIALOG, EDIT_FIELDS_DIALOG, EXPORT_CONTENT_TYPE_DIALOG, IMPORT_CONTENT_TYPE_DIALOG, SET_PERMISSIONS_DIALOG, CONTENT_TYPES_FIELDS_ADD_DIALOG } from '../../constants/dialog-names';
import { Context } from '../../context/context';
import { AppsManagementNavComponent } from '../../../apps-management/apps-management-nav/apps-management-nav.component';
import { ImportAppComponent } from '../../../apps-management/shared/modals/import-app/import-app.component';
import { EnableLanguagesComponent } from '../../../apps-management/shared/modals/enable-languages/enable-languages.component';
import { AppAdministrationNavComponent } from '../../../app-administration/app-administration-nav/app-administration-nav.component';
import { CodeEditorComponent } from '../../../code-editor/code-editor/code-editor.component';
import { EditContentTypeComponent } from '../../../app-administration/shared/modals/edit-content-type/edit-content-type.component';
import { DialogService } from '../dialog-service/dialog.service';
import { EditFieldsComponent } from '../../../app-administration/shared/modals/edit-fields/edit-fields.component';
import { ContentExportComponent } from '../../../app-administration/shared/modals/content-export/content-export.component';
import { ContentImportComponent } from '../../../app-administration/shared/modals/content-import/content-import.component';
import { PermissionsComponent } from '../../../app-administration/shared/modals/permissions/permissions.component';
import { ContentTypesFieldsAddComponent } from '../../../app-administration/shared/modals/content-types-fields-add/content-types-fields-add.component';

@Component({
  selector: 'app-dialog-entry',
  templateUrl: './dialog-entry.component.html',
  styleUrls: ['./dialog-entry.component.scss']
})
export class DialogEntryComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private dialogRef: MatDialogRef<any, any>;
  private dialogName: string;
  private component: any;
  private panelSize: 'small' | 'medium' | 'large' | 'fullscreen'; // has to match css

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private dialogService: DialogService,
  ) {
    this.configureDialog();
  }

  ngOnInit() {
    console.log('Open dialog:', this.dialogName, 'Context id:', this.context.id, 'Context:', this.context);

    this.dialogRef = this.dialog.open(this.component, {
      backdropClass: 'dialog-backdrop',
      panelClass: ['dialog-panel', `dialog-panel-${this.panelSize}`],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });

    this.subscription.add(
      this.dialogRef.afterClosed().subscribe(() => {
        console.log('Dialog was closed:', this.dialogName);
        this.dialogService.fireClosed(this.dialogName);

        if (this.route.pathFromRoot.length <= 3) {
          alert('Close iframe!');
          return;
        }

        if (this.route.snapshot.url.length > 0) {
          this.router.navigate(['./'], { relativeTo: this.route.parent });
        } else {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      }),
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
      case ENABLE_LANGUAGES_DIALOG:
        this.component = EnableLanguagesComponent;
        this.panelSize = 'medium';
        break;

      case APP_ADMINISTRATION_DIALOG:
        // this is module root dialog and has to init context
        this.component = AppAdministrationNavComponent;
        this.panelSize = 'large';
        this.context.init(this.route);
        break;
      case ADD_CONTENT_TYPE_DIALOG:
        this.component = EditContentTypeComponent;
        this.panelSize = 'small';
        break;
      case EDIT_CONTENT_TYPE_DIALOG:
        this.component = EditContentTypeComponent;
        this.panelSize = 'small';
        break;
      case EDIT_FIELDS_DIALOG:
        this.component = EditFieldsComponent;
        this.panelSize = 'large';
        break;
      case CONTENT_TYPES_FIELDS_ADD_DIALOG:
        this.component = ContentTypesFieldsAddComponent;
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

      case CODE_EDITOR_DIALOG:
        // this is module root dialog and has to init context
        this.component = CodeEditorComponent;
        this.panelSize = 'fullscreen';
        this.context.init(this.route);
        break;
      default:
        throw new Error(`This Dialog was not configured: ${this.dialogName}.`);
    }
  }

}
