import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { DialogSettings } from '../models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { GlobalConfigurationService } from '../../../../../edit/shared/services/global-configuration.service';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
  private tabIndex$ = new BehaviorSubject<number>(null);
  private dialogSettings$ = new BehaviorSubject<DialogSettings>(null);
  templateVars$ = combineLatest([this.tabIndex$, this.dialogSettings$]).pipe(
    map(([tabIndex, dialogSettings]) => ({ tabIndex, dialogSettings })),
  );

  private tabs = ['home', 'data', 'queries', 'views', 'web-api', 'app']; // tabs have to match template and filter below
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private globalConfigurationService: GlobalConfigurationService,
  ) { }

  ngOnInit() {
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      if (!dialogSettings.Context.Enable.Query) {
        this.tabs = this.tabs.filter(tab => tab !== 'queries' && tab !== 'web-api');
      }
      const tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path); // set tab initially
      this.tabIndex$.next(tabIndex);
      this.dialogSettings$.next(dialogSettings); // needed to filter tabs
    });
    this.subscription.add(
      // change tab when route changed
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        const tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path);
        this.tabIndex$.next(tabIndex);
      })
    );
  }

  ngOnDestroy() {
    this.tabIndex$.complete();
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

  toggleDebugEnabled(event: MouseEvent) {
    const enableDebugEvent = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.shiftKey && event.altKey;
    if (enableDebugEvent) { this.globalConfigurationService.toggleDebugEnabled(); }
  }
}
