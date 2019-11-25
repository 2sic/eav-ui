import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';

import { AppsManagementNavigationComponent } from '../apps-management-navigation/apps-management-navigation.component';

@Component({
  selector: 'app-apps-management-router',
  templateUrl: './apps-management-router.component.html',
  styleUrls: ['./apps-management-router.component.scss']
})
export class AppsManagementRouterComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private appsManagementDialogRef: MatDialogRef<AppsManagementNavigationComponent, any>;
  private tab$$: BehaviorSubject<string>;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.tab$$ = new BehaviorSubject<string>('apps');
    this.appsManagementDialogRef = this.dialog.open(AppsManagementNavigationComponent, {
      backdropClass: 'apps-management-dialog-backdrop',
      panelClass: 'apps-management-dialog-panel',
      data: {
        zoneId: this.route.parent.snapshot.paramMap.get('zoneId'),
        tab$: this.tab$$.asObservable(),
      }
    });
    this.subscriptions.push(
      this.appsManagementDialogRef.afterClosed().subscribe(result => {
        console.log('Apps management dialog was closed. Result:', result);
        this.router.navigate(['../'], { relativeTo: this.route });
      }),
      this.appsManagementDialogRef.componentInstance.onChangeTab.subscribe((url: string) => {
        this.router.navigate([url], { relativeTo: this.route });
        this.tab$$.next(url);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.tab$$.complete();
    this.appsManagementDialogRef.close();
  }
}
