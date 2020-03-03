import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DialogSettings } from '../shared/models/dialog-settings.model';
import { AppDialogConfigService } from '../shared/services/app-dialog-config.service';
import { GlobalConfigurationService } from '../../../../../edit/shared/services/global-configuration.service';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss']
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
  tabs = ['home', 'data', 'queries', 'views', 'web-api', 'app']; // tabs has to match template and filter below
  tabIndex: number;
  dialogSettings: DialogSettings;

  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private globalConfigurationService: GlobalConfigurationService,
  ) { }

  ngOnInit() {
    // set tab initially
    this.tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path);

    this.subscription.add(
      // change tab when route changed
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
        this.tabIndex = this.tabs.indexOf(this.route.snapshot.firstChild.url[0].path);
      })
    );
    this.subscription.add(
      this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
        if (dialogSettings.IsContent) {
          this.tabs = this.tabs.filter(tab => {
            return !(tab === 'queries' || tab === 'web-api' || tab === 'app');
          });
        }
        this.dialogSettings = dialogSettings; // needed to filter tabs
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
