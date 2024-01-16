import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith } from 'rxjs';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { eavConstants } from '../../shared/constants/eav.constants';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss'],
})
export class AppAdministrationNavComponent extends BaseComponent implements OnInit, OnDestroy {
  AppScopes = AppScopes;


  private dialogSettings$ = new BehaviorSubject<DialogSettings>(undefined);
  private tabs$ = new BehaviorSubject<string[]>(undefined);
  private tabIndex$ = combineLatest([
    this.tabs$,
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.route.snapshot.firstChild.url[0].path),
      startWith(this.route.snapshot.firstChild.url[0].path),
    )
  ]).pipe(
    map(([tabs, path]) => {
      if (tabs == null) { return; }
      const tabIndex = tabs.indexOf(path);
      return tabIndex;
    }),
    filter(tabIndex => tabIndex >= 0),
  );
  viewModel$ = combineLatest([this.dialogSettings$, this.tabIndex$]).pipe(
    map(([dialogSettings, tabIndex]) => {
      return { dialogSettings, tabIndex };
    }),
  );

  smallScreen: MediaQueryList = this.media.matchMedia('(max-width: 1000px)');
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sideNavOpened = !this.smallScreen.matches;

  currentRoute: string;

  navItems = [
    { name: 'Info', path: 'home', icon: 'info' },
    { name: 'Data', path: 'data' , icon: 'menu' },
    { name: 'Queries', path: 'queries', icon: 'filter_list' },
    { name: 'Views', path: 'views', icon: 'layers' },
    { name: 'Web API', path: 'web-api', icon: 'offline_bolt' },
    { name: 'App', path: 'app', icon: 'settings_applications' },
    { name: 'Sync', path: 'sync', icon: 'sync' },
  ];

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private media: MediaMatcher,
  ) {
    super(router, route);
  }

  ngOnInit() {
    this.fetchDialogSettings();
    this.subscription.add(this.refreshOnChildClosedDeep().subscribe(() => { this.fetchDialogSettings(); }));

    this.smallScreen.addEventListener(
      'change',
      (c) => (this.sidenav.opened = !c.matches)
    );
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    this.tabs$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    let path = this.tabs$.value[event.index];
    if (path === 'data') {
      path = `data/${eavConstants.scopes.default.value}`;
    }
    this.router.navigate([path], { relativeTo: this.route });
  }

  changeUrl(index: number) {
    let path = this.tabs$.value[index];
    this.currentRoute = path;
    console.error(path);
    if (path === 'data') {
      path = `data/${eavConstants.scopes.default.value}`;
    }
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$()/*.getDialogSettings()*/.subscribe(dialogSettings => {
      UpdateEnvVarsFromDialogSettings(dialogSettings.Context.App);
      this.dialogSettings$.next(dialogSettings);

      if (!dialogSettings.Context.Enable.Query)
        this.navItems = this.navItems.filter(item => item.name !== 'Queries' && item.name !== 'Web API');

      this.tabs$.next(this.navItems.map(item => item.path));
    });
  }
}
