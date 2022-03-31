import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { DialogSettings } from '../../app-administration/models';
import { AppDialogConfigService } from '../../app-administration/services';
import { Context } from '../../shared/services/context';

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss'],
})
export class AppsManagementNavComponent implements OnInit, OnDestroy {
  zoneId = this.context.zoneId;
  dialogSettings$ = new BehaviorSubject<DialogSettings>(undefined);

  private tabs = ['system', 'list', 'languages', 'license']; // tabs order has to match template
  tabIndex$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path)),
    filter(tabIndex => tabIndex >= 0),
    startWith(this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path)),
  );
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private appDialogConfigService: AppDialogConfigService,
  ) { }

  ngOnInit() {
    this.fetchDialogSettings();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    const path = this.tabs[event.index];
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getDialogSettings(0).subscribe(dialogSettings => {
      this.dialogSettings$.next(dialogSettings);
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchDialogSettings();
      })
    );
  }
}
