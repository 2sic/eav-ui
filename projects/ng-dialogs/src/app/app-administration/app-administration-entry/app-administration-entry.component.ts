import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';

import { AppAdministrationNavigationComponent } from '../app-administration-navigation/app-administration-navigation.component';
import { AppAdministrationParamsService } from '../shared/app-administration-params.service';
import { Context } from '../../shared/context/context';

@Component({
  selector: 'app-app-administration-entry',
  templateUrl: './app-administration-entry.component.html',
  styleUrls: ['./app-administration-entry.component.scss'],
  // providers: [Context],
})
export class AppAdministrationEntryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private appAdministrationDialogRef: MatDialogRef<AppAdministrationNavigationComponent, any>;
  private tabPath$$ = new BehaviorSubject<string>(undefined);

  private appId: number;
  private zoneId: number;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private appAdministrationParamsService: AppAdministrationParamsService,
    public context: Context,
  ) {
    context.init(route);
    // console.log('appAdminHost', {appId});
  }

  ngOnInit() {
    this.appId = parseInt(this.route.snapshot.paramMap.get('appId'), 10);
    this.zoneId = parseInt(this.route.snapshot.parent.parent.paramMap.get('zoneId'), 10);

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
