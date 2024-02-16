import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith } from 'rxjs';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { NavItem } from '../../shared/models/nav-item.model';

const navItems: NavItem[] = [
  { name: 'Info', path: 'home', icon: 'info', tippy: 'App Info' },
  { name: 'Data', path: 'data/Default', icon: 'menu', tippy: 'Data / Content' },
  {
    name: 'Queries',
    path: 'queries',
    icon: 'filter_list',
    tippy: 'Queries / Visual Query Designer',
  },
  {
    name: 'Views',
    path: 'views',
    icon: 'layers',
    tippy: 'Views / Templates',
  },
  { name: 'Web API', path: 'web-api', icon: 'offline_bolt', tippy: 'WebApi' },
  {
    name: 'App',
    path: 'app',
    icon: 'settings_applications',
    tippy: 'App Settings',
  },
  { name: 'Sync', path: 'sync', icon: 'sync', tippy: 'App Export / Import' },
];

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss'],
})
export class AppAdministrationNavComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  AppScopes = AppScopes;

  private dialogSettings$ = new BehaviorSubject<DialogSettings>(undefined);
  private pathsArray$ = new BehaviorSubject<string[]>(undefined);
  private currentPath$ = combineLatest([
    this.pathsArray$,
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.route.snapshot.firstChild.url[0].path),
      startWith(this.route.snapshot.firstChild.url[0].path)
    ),
  ]).pipe(
    map(([paths, currentPath]) => {
      if (paths == null) return;
      return currentPath;
    })
  );

  // Generate View Model
  viewModel$ = combineLatest([this.dialogSettings$, this.currentPath$]).pipe(
    map(([dialogSettings, currentPath]) => {
      return {
        dialogSettings,
        currentPath,
      };
    })
  );

  smallScreen: MediaQueryList = this.media.matchMedia('(max-width: 1000px)');
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sideNavOpened = !this.smallScreen.matches;

  /** Navigation menu buttons - prefilled; may be modified after settings are loaded */
  navItems = navItems;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private media: MediaMatcher
  ) {
    super(router, route);
  }

  ngOnInit() {
    this.fetchDialogSettings();
    this.subscription.add(
      this.refreshOnChildClosedDeep().subscribe(() => {
        this.fetchDialogSettings();
      })
    );

    this.smallScreen.addEventListener(
      'change',
      (c) => (this.sidenav.opened = !c.matches)
    );
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    this.pathsArray$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeUrl(path: string) {
    // @2dg route to data/default ??
    // if (path === 'data') path = `data/${eavConstants.scopes.default.value}`;
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$().subscribe((dialogSettings) => {
      UpdateEnvVarsFromDialogSettings(dialogSettings.Context.App);
      this.dialogSettings$.next(dialogSettings);

      if (!dialogSettings.Context.Enable.Query)
        this.navItems = this.navItems.filter(
          (item) => item.name !== 'Queries' && item.name !== 'Web API'
        );

      this.pathsArray$.next(this.navItems.map((item) => item.path));
    });
  }
}
