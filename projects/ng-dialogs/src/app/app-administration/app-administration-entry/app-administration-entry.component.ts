import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppAdministrationNavComponent } from '../app-administration-nav/app-administration-nav.component';
import { Context } from '../../shared/context/context';

@Component({
  selector: 'app-app-administration-entry',
  templateUrl: './app-administration-entry.component.html',
  styleUrls: ['./app-administration-entry.component.scss'],
  providers: [Context],
})
export class AppAdministrationEntryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private appAdministrationDialogRef: MatDialogRef<AppAdministrationNavComponent, any>;

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
    this.appAdministrationDialogRef = this.dialog.open(AppAdministrationNavComponent, {
      backdropClass: 'app-administration-dialog-backdrop',
      panelClass: ['app-administration-dialog-panel', 'dialog-panel-large'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscriptions.push(
      this.appAdministrationDialogRef.afterClosed().subscribe(() => {
        console.log('App administration dialog was closed.');
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
    this.appAdministrationDialogRef.close();
    this.appAdministrationDialogRef = null;
  }
}
