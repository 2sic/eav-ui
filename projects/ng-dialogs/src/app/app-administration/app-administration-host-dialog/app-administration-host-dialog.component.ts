import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';

import { AppAdministrationNavigationComponent } from '../app-administration-navigation/app-administration-navigation.component';
import { AppAdministrationParamsService } from '../shared/app-administration-params.service';

@Component({
  selector: 'app-app-administration-host-dialog',
  templateUrl: './app-administration-host-dialog.component.html',
  styleUrls: ['./app-administration-host-dialog.component.scss']
})
export class AppAdministrationHostDialogComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private appAdministrationDialogRef: MatDialogRef<AppAdministrationNavigationComponent, any>;
  private tabPath$$ = new BehaviorSubject<string>(undefined);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private appAdministrationParamsService: AppAdministrationParamsService,
  ) { }

  ngOnInit() {
    this.appAdministrationDialogRef = this.dialog.open(AppAdministrationNavigationComponent, {
      backdropClass: 'app-administration-dialog-backdrop',
      panelClass: 'app-administration-dialog-panel',
      data: {
        tabPath$: this.tabPath$$.asObservable(),
      }
    });
    this.subscriptions.push(
      this.appAdministrationParamsService.selectedTabPath.subscribe(tabPath => {
        this.tabPath$$.next(tabPath);
      }),
      this.appAdministrationDialogRef.componentInstance.onChangeTab.subscribe((url: string) => {
        this.router.navigate([url], { relativeTo: this.route });
      }),
      this.appAdministrationDialogRef.afterClosed().subscribe(result => {
        console.log('App administration dialog was closed. Result:', result);
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
    this.tabPath$$.complete();
    this.tabPath$$ = null;
  }
}
