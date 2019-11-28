import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';

import { AppAdministrationNavComponent } from '../app-administration-nav/app-administration-nav.component';
import { AppAdministrationParamsService } from '../shared/services/app-administration-params.service';
import { AppAdministrationDialogData } from '../shared/models/app-administration-dialog-data.model';
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
  private tabPath$$ = new BehaviorSubject<string>(undefined);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private appAdministrationParamsService: AppAdministrationParamsService,
    public context: Context,
  ) {
    context.init(route);
  }

  ngOnInit() {
    const dialogData: AppAdministrationDialogData = {
      context: this.context,
      tabPath$: this.tabPath$$.asObservable(),
    };
    this.appAdministrationDialogRef = this.dialog.open(AppAdministrationNavComponent, {
      backdropClass: 'app-administration-dialog-backdrop',
      panelClass: 'app-administration-dialog-panel',
      data: dialogData,
    });
    this.subscriptions.push(
      this.appAdministrationParamsService.selectedTabPath$$.subscribe(tabPath => {
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
