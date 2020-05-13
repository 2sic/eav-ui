import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DialogSettings } from '../models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { GlobalConfigurationService } from '../../../../../edit/shared/services/global-configuration.service';
import { Context } from '../../shared/services/context';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss']
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
  tabs = ['home', 'data', 'queries', 'views', 'web-api', 'app']; // tabs have to match template and filter below
  tabIndex: number;
  dialogSettings: DialogSettings;

  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private globalConfigurationService: GlobalConfigurationService,
    private context: Context,
  ) { }

  ngOnInit() {
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      this.context.appRoot = dialogSettings.AppPath;
      if (dialogSettings.IsContent) {
        this.tabs = this.tabs.filter(tab => !(tab === 'queries' || tab === 'web-api'));
      }
      this.tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path); // set tab initially
      this.dialogSettings = dialogSettings; // needed to filter tabs
    });
    this.subscription.add(
      // change tab when route changed
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        this.tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
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
