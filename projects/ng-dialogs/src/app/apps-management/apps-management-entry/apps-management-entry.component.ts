import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppsManagementNavComponent } from '../apps-management-nav/apps-management-nav.component';
import { Context } from '../../shared/context/context';

@Component({
  selector: 'app-apps-management-entry',
  templateUrl: './apps-management-entry.component.html',
  styleUrls: ['./apps-management-entry.component.scss'],
  providers: [Context],
})
export class AppsManagementEntryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private appsManagementDialogRef: MatDialogRef<AppsManagementNavComponent, any>;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.context.init(route);
  }

  ngOnInit() {
    this.appsManagementDialogRef = this.dialog.open(AppsManagementNavComponent, {
      backdropClass: 'apps-management-dialog-backdrop',
      panelClass: ['apps-management-dialog-panel', 'dialog-panel-large'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscriptions.push(
      this.appsManagementDialogRef.afterClosed().subscribe(() => {
        console.log('Apps management dialog was closed.');
        if (this.route.parent.parent.parent) {
          this.router.navigate(['../'], { relativeTo: this.route });
        } else {
          alert('Close iframe!');
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
    this.appsManagementDialogRef.close();
    this.appsManagementDialogRef = null;
  }
}
