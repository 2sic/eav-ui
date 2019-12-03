import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';

import { AppsManagementNavComponent } from '../apps-management-nav/apps-management-nav.component';
import { AppsManagementParamsService } from '../shared/services/apps-management-params.service';
import { AppsManagementDialogData } from '../shared/models/apps-management-dialog-data.model';
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
  private tabPath$$ = new BehaviorSubject<string>(undefined);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private appsManagementParamsService: AppsManagementParamsService,
    public context: Context,
  ) {
    context.init(route);
  }

  ngOnInit() {
    const dialogData: AppsManagementDialogData = {
      context: this.context,
      tabPath$: this.tabPath$$.asObservable(),
    };
    this.appsManagementDialogRef = this.dialog.open(AppsManagementNavComponent, {
      backdropClass: 'apps-management-dialog-backdrop',
      panelClass: 'apps-management-dialog-panel',
      data: dialogData,
    });
    this.subscriptions.push(
      this.appsManagementParamsService.selectedTabPath$$.subscribe(tabPath => {
        this.tabPath$$.next(tabPath);
      }),
      this.appsManagementDialogRef.componentInstance.onChangeTab.subscribe((url: string) => {
        this.router.navigate([url], { relativeTo: this.route });
      }),
      this.appsManagementDialogRef.componentInstance.onOpenApp.subscribe((openedAppId: number) => {
        this.router.navigate([openedAppId], { relativeTo: this.route });
      }),
      this.appsManagementDialogRef.afterClosed().subscribe(result => {
        console.log('Apps management dialog was closed. Result:', result);
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
    this.tabPath$$.complete();
    this.tabPath$$ = null;
    this.appsManagementDialogRef.close();
    this.appsManagementDialogRef = null;
  }
}
