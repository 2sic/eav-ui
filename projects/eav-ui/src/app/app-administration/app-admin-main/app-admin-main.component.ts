import { MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItemDirective } from 'xng-breadcrumb';
import { transient } from '../../../../../core';
import { NavItemListComponent } from '../../shared/components/nav-item-list/nav-item-list.component';
import { ToggleDebugDirective } from '../../shared/directives/toggle-debug.directive';
import { Update$2sxcEnvFromContext } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { classLog } from '../../shared/logging';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { AppAdminMenu } from './app-admin-menu';

@Component({
    selector: 'app-app-admin-main',
    templateUrl: './app-admin-main.component.html',
    styleUrls: ['./app-admin-main.component.scss'],
    imports: [
        MatToolbarModule,
        MatIconModule,
        BreadcrumbComponent,
        BreadcrumbItemDirective,
        MatButtonModule,
        MatSidenavModule,
        RouterOutlet,
        NavItemListComponent,
        ToggleDebugDirective,
    ]
})
export class AppAdminMainComponent implements OnInit {

  log = classLog({ AppAdminMainComponent });

  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<AppAdminMainComponent>,
    private media: MediaMatcher
  ) {
    this.log.a('constructor');
  }

  AppScopes = AppScopes;

  dialogSettings = signal<DialogSettings>(undefined);

  smallScreen: MediaQueryList = this.media.matchMedia('(max-width: 1000px)');
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sideNavOpened = !this.smallScreen.matches;

  /** Navigation menu buttons - prefilled; may be modified after settings are loaded */
  navItems = AppAdminMenu;
  matcher!: MediaQueryList;


  ngOnInit() {
    this.fetchDialogSettings();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchDialogSettings());

    this.smallScreen.addEventListener(
      'change',
      (c) => (
        this.sidenav.opened = !c.matches,
        this.sidenav.mode = c.matches ? 'over' : 'side'
      )
    );
  }


  closeDialog() {
    this.dialog.close();
  }

  private fetchDialogSettings() {
    this.#dialogConfigSvc.getCurrent$().subscribe(dialogSettings => {
      Update$2sxcEnvFromContext(dialogSettings.Context.App);
      this.dialogSettings.set(dialogSettings);

      if (!dialogSettings.Context.Enable.Query)
        this.navItems = this.navItems.filter(
          (item) => item.name !== 'Queries' && item.name !== 'Web API'
        );
    });
  }
}
