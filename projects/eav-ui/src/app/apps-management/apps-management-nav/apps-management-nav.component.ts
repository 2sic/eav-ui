import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, map, startWith } from 'rxjs';
import { DialogSettings } from '../../app-administration/models';
import { AppDialogConfigService } from '../../app-administration/services';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { Context } from '../../shared/services/context';

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss'],
})
export class AppsManagementNavComponent extends BaseComponent implements OnInit, OnDestroy {
  zoneId = this.context.zoneId;
  dialogSettings$ = new BehaviorSubject<DialogSettings>(undefined);

  private tabs = ['system', 'list', 'languages', 'license']; // tabs order has to match template
  tabIndex$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path)),
    filter(tabIndex => tabIndex >= 0),
    startWith(this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path)),
  );

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private context: Context,
    private appDialogConfigService: AppDialogConfigService,
  ) {
    super(router, route);
   }

  ngOnInit() {
    this.fetchDialogSettings();
    this.subscription.add(this.refreshOnChildClosedDeep().subscribe(() => { this.fetchDialogSettings(); }));
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    const path = this.tabs[event.index];
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$(0)/*.getDialogSettings(0)*/.subscribe(dialogSettings => {
      this.dialogSettings$.next(dialogSettings);
    });
  }
}
