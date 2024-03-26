import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith, tap } from 'rxjs';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppAdminMenu } from './app-admin-menu';
import { EavLogger } from '../../shared/logging/eav-logger';

const logThis = true;

@Component({
  selector: 'app-app-admin-main',
  templateUrl: './app-admin-main.component.html',
  styleUrls: ['./app-admin-main.component.scss'],
  providers: [
    // Must have a new config service here, to restart with new settings
    // which are injected into it from the context
    // Because of standalone-components, it's not enough to have it in the module-definition
    AppDialogConfigService,
  ],
})
export class AppAdminMainComponent extends BaseComponent implements OnInit, OnDestroy {

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<AppAdminMainComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private media: MediaMatcher
  ) {
    super(router, route, new EavLogger('AppAdminMainComponent', logThis));
    this.logger.add('constructor', 'appDialogConfigService', appDialogConfigService);
  }
  
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
  navItems = AppAdminMenu;

  matcher!: MediaQueryList;


  ngOnInit() {

    this.fetchDialogSettings();
    this.subscription.add(
      this.refreshOnChildClosedShallow().subscribe(() => {
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
    this.dialogSettings$.complete();
    this.pathsArray$.complete();
    super.ngOnDestroy();
  }


  closeDialog() {
    this.dialogRef.close();
  }

  // @2dg not longer in use with new routing SideNav
  // changeUrl(path: string) {
  //   // if (path === 'data') path = `data/${eavConstants.scopes.default.value}`;
  //   // this.router.navigate([path], { relativeTo: this.route });
  // }

  private fetchDialogSettings() {
    this.appDialogConfigService.getCurrent$().subscribe((dialogSettings) => {
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
