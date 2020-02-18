import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss']
})
export class AppsManagementNavComponent implements OnInit, OnDestroy {
  tabs = ['list', 'languages', 'features', 'sxc-insights']; // tabs order has to match template
  tabIndex: number;

  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // set tab initially
    this.tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path);

    this.subscriptions.push(
      // change tab when route changed
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        this.tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    const path = this.tabs[event.index];
    this.router.navigate([path], { relativeTo: this.route });
  }

}
