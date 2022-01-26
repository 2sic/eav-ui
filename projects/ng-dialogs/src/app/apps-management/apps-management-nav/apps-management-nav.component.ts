import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Context } from '../../shared/services/context';

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss'],
})
export class AppsManagementNavComponent implements OnInit {
  zoneId = this.context.zoneId;

  private tabs = ['system', 'list', 'languages', 'settings', 'license', 'features', 'sxc-insights']; // tabs order has to match template
  tabIndex$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path)),
    filter(tabIndex => tabIndex >= 0),
    startWith(this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path)),
  );

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
  ) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    const path = this.tabs[event.index];
    this.router.navigate([path], { relativeTo: this.route });
  }
}
