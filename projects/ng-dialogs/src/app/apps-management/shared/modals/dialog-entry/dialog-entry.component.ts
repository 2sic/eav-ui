import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

// tslint:disable-next-line:max-line-length
import { APPS_MANAGEMENT_DIALOG, APPS_MANAGEMENT_DIALOG_CLOSED, IMPORT_APP_DIALOG, IMPORT_APP_DIALOG_CLOSED, ENABLE_LANGUAGES_DIALOG, ENABLE_LANGUAGES_DIALOG_CLOSED } from '../../constants/navigation-messages';
import { Context } from '../../../../shared/context/context';
import { AppsManagementNavComponent } from '../../../apps-management-nav/apps-management-nav.component';
import { ImportAppComponent } from '../import-app/import-app.component';
import { EnableLanguagesComponent } from '../enable-languages/enable-languages.component';

@Component({
  selector: 'app-dialog-entry',
  templateUrl: './dialog-entry.component.html',
  styleUrls: ['./dialog-entry.component.scss']
})
export class DialogEntryComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private dialogRef: MatDialogRef<any, any>;
  private dialogType: string;
  private component: any;
  private panelSize: string;
  private onCloseMessage: string;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
  ) {
    this.configureDialog();
  }

  ngOnInit() {
    console.log('Open dialog:', this.dialogType, 'Context id:', this.context.id, 'Context:', this.context);
    this.dialogRef = this.dialog.open(this.component, {
      backdropClass: 'dialog-backdrop',
      panelClass: ['dialog-panel', `dialog-panel-${this.panelSize}`],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscription.add(
      this.dialogRef.afterClosed().subscribe(() => {
        console.log('Dialog was closed:', this.onCloseMessage);
        if (this.route.pathFromRoot.length > 3) {
          this.router.navigate(['../'], { relativeTo: this.route, state: { message: this.onCloseMessage } });
        } else {
          alert('Close iframe!');
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
    this.dialogType = this.route.snapshot.data.dialogType;
    if (!this.dialogType) {
      throw new Error(`Could not find dialog type: ${this.dialogType}. Did you forget to add dialogType to route data?`);
    }

    switch (this.dialogType) {
      case APPS_MANAGEMENT_DIALOG:
        // this is module root dialog and has to init context
        this.component = AppsManagementNavComponent;
        this.panelSize = 'large';
        this.onCloseMessage = APPS_MANAGEMENT_DIALOG_CLOSED;
        this.context.init(this.route);
        break;
      case IMPORT_APP_DIALOG:
        this.component = ImportAppComponent;
        this.panelSize = 'medium';
        this.onCloseMessage = IMPORT_APP_DIALOG_CLOSED;
        break;
      case ENABLE_LANGUAGES_DIALOG:
        this.component = EnableLanguagesComponent;
        this.panelSize = 'medium';
        this.onCloseMessage = ENABLE_LANGUAGES_DIALOG_CLOSED;
        break;
      default:
        throw new Error(`This Dialog was not configured: ${this.dialogType}.`);
    }
  }

}
