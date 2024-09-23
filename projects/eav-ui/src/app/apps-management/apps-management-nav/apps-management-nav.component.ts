import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { Context } from '../../shared/services/context';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { DialogConfigGlobalService } from '../../app-administration/services';
import { AppsManagementNavItems } from './managment-nav-items';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavItemListComponent } from '../../shared/components/nav-item-list/nav-item-list.component';
import { ToggleDebugDirective } from '../../shared/directives/toggle-debug.directive';
import { transient } from '../../core';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    BreadcrumbModule,
    MatButtonModule,
    MatSidenavModule,
    RouterOutlet,
    NavItemListComponent,
    ToggleDebugDirective,
  ],
})
export class AppsManagementNavComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  #globalDialogConfigSvc = inject(DialogConfigGlobalService);

  zoneId = this.context.zoneId;

  smallScreen: MediaQueryList = this.media.matchMedia('(max-width: 1000px)');
  sideNavOpened = !this.smallScreen.matches;

  navItems = AppsManagementNavItems;
  #dialogClose = transient(DialogRoutingService);

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private context: Context,
    private media: MediaMatcher,
  ) {
  }

  ngOnInit() {
    this.fetchDialogSettings();

    // Trigger settings load? not sure why, because it's cached in the service... on dialog close?
    this.#dialogClose.doOnDialogClosed(() => this.fetchDialogSettings());

    this.smallScreen.addEventListener('change', c => (
      this.sidenav.opened = !c.matches,
      this.sidenav.mode = c.matches ? 'over' : 'side'
    ));
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchDialogSettings() {
    this.#globalDialogConfigSvc.getShared$(0).subscribe();
  }

}
