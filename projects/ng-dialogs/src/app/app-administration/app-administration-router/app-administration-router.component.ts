import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppAdministrationNavigationComponent } from '../app-administration-navigation/app-administration-navigation.component';

@Component({
  selector: 'app-app-administration-router',
  templateUrl: './app-administration-router.component.html',
  styleUrls: ['./app-administration-router.component.scss']
})
export class AppAdministrationRouterComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private appAdministrationDialogRef: MatDialogRef<AppAdministrationNavigationComponent, any>;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.appAdministrationDialogRef = this.dialog.open(AppAdministrationNavigationComponent, {
      backdropClass: 'app-administration-dialog-backdrop',
      panelClass: 'app-administration-dialog-panel',
      data: {
      }
    });
    this.subscriptions.push(
      this.appAdministrationDialogRef.afterClosed().subscribe(result => {
        console.log('App administration dialog was closed. Result:', result);
        this.router.navigate(['../'], { relativeTo: this.route });
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}
