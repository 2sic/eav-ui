import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { combineLatest, filter, map, startWith } from 'rxjs';
import { BaseWithChildDialogComponent } from '../../shared/components/base-component/base-with-child-dialog.component';
import { Context } from '../../shared/services/context';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppDialogConfigService } from '../../app-administration/services';
import { AppsManagementNavItems } from './managment-nav-items';
import { AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavItemListComponent } from '../../shared/components/nav-item-list/nav-item-list.component';

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
    SharedComponentsModule,
    MatSidenavModule,
    RouterOutlet,
    AsyncPipe,
    NavItemListComponent
  ],
  providers: [
    AppDialogConfigService,
  ]
})
export class AppsManagementNavComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {

  zoneId = this.context.zoneId;


  private currentPath$ = combineLatest([
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.route.snapshot.firstChild.url[0].path),
      startWith(this.route.snapshot.firstChild.url[0].path)
    ),
  ]).pipe(
    map(([paths]) => {
      if (paths == null) return;
      return paths;
    })
  );

  // Generate View Model
  viewModel$ = combineLatest([this.currentPath$]).pipe(
    map(([currentPath]) => {
      return {
        currentPath,
      };
    })
  );

  smallScreen: MediaQueryList = this.media.matchMedia('(max-width: 1000px)');
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sideNavOpened = !this.smallScreen.matches;

  navItems = AppsManagementNavItems;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private context: Context,
    private media: MediaMatcher,
    private appDialogConfigService: AppDialogConfigService,
  ) {
    super(router, route);
  }

  ngOnInit() {
    this.fetchDialogSettings();
    this.subscription.add(
      this.childDialogClosed$().subscribe(() => {
        this.fetchDialogSettings();
      })
    );

    this.smallScreen.addEventListener(
      'change',
      (c) => (
        this.sidenav.opened = !c.matches,
        this.sidenav.mode = c.matches ? 'over' : 'side'
      )
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // @2dg not longer in use with new routing SideNav
  // changeUrl(path: string) {
  //   this.router.navigate([path], { relativeTo: this.route });
  // }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$(0).subscribe();
  }

}
