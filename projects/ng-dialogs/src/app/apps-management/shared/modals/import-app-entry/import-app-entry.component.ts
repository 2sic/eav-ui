import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { ImportAppComponent } from '../import-app/import-app.component';
import { IMPORT_APP_DIALOG_CLOSED } from '../../constants/navigation-messages';

@Component({
  selector: 'app-import-app-entry',
  templateUrl: './import-app-entry.component.html',
  styleUrls: ['./import-app-entry.component.scss']
})
export class ImportAppEntryComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private importAppDialogRef: MatDialogRef<ImportAppComponent, any>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    console.log('Open import app dialog');
    this.importAppDialogRef = this.dialog.open(ImportAppComponent, {
      backdropClass: 'import-app-dialog-backdrop',
      panelClass: ['import-app-dialog-panel', 'dialog-panel-medium'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscription.add(
      this.importAppDialogRef.afterClosed().subscribe(() => {
        console.log('Import app dialog was closed.');
        this.router.navigate(['../'], {
          relativeTo: this.route,
          state: {
            message: IMPORT_APP_DIALOG_CLOSED,
          }
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
    this.importAppDialogRef.close();
    this.importAppDialogRef = null;
  }

}
