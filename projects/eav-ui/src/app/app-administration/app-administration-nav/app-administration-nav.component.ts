import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith, tap } from 'rxjs';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { eavConstants } from '../../shared/constants/eav.constants';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';

/** Interface to store navigation object to configure menus */
interface NavItem {
  name: string;
  path: string;
  icon: string;
  tippy: string;
}

const navItems: NavItem[] = [
  { name: 'Info', path: 'home', icon: 'info', tippy: 'App Info' },
  { name: 'Data', path: 'data', icon: 'menu', tippy: 'Data / Content' },
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
  private path$ = new BehaviorSubject<string[]>(undefined);
  private pathIndex$ = combineLatest([
    this.path$,
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.route.snapshot.firstChild.url[0].path),
      startWith(this.route.snapshot.firstChild.url[0].path)
    ),
  ]).pipe(
    tap(([paths, currentPath]) => {
      console.log('2dm paths', paths, currentPath);
    }),
    map(([tabs, path]) => {
      if (tabs == null) return;
      console.warn(path)
      const index = tabs.indexOf(path);
      console.log('2dm index/path', index, path);
      return { index, path };
    }),
    // note: PathInfo can be undefined if the path$ is not loaded yet from settings
    filter((pathInfo) => pathInfo?.index >= 0)
  );

  // Generate View Model
  viewModel$ = combineLatest([this.dialogSettings$, this.pathIndex$]).pipe(
    map(([dialogSettings, pathInfo]) => {
      return {
        dialogSettings,
        pathIndex: pathInfo.index,
        path: pathInfo.path,
      };
    })
  );

  smallScreen: MediaQueryList = this.media.matchMedia('(max-width: 1000px)');
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sideNavOpened = !this.smallScreen.matches;
  currentRoute: string;

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

    this.viewModel$.subscribe((viewModel) => {
      console.warn("viewMo",viewModel)
    })
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    this.path$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeUrl(index: number) {
    console.warn(index)
    let path = this.path$.value[index];
    console.warn(path)
    if(this.currentRoute === path) return;
    console.warn(path)
    this.currentRoute = path;
    if (path === 'data') path = `data/${eavConstants.scopes.default.value}`;
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$().subscribe((dialogSettings) => {
      UpdateEnvVarsFromDialogSettings(dialogSettings.Context.App);
      console.log(dialogSettings)
      this.dialogSettings$.next(dialogSettings);

      if (!dialogSettings.Context.Enable.Query)
        this.navItems = this.navItems.filter(
          (item) => item.name !== 'Queries' && item.name !== 'Web API'
        );

      this.path$.next(this.navItems.map((item) => item.path));
    });
  }
}
