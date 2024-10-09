import { MediaMatcher } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith } from 'rxjs';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { transient } from '../../../../../core';
import { NavItemListComponent } from '../../shared/components/nav-item-list/nav-item-list.component';
import { ToggleDebugDirective } from '../../shared/directives/toggle-debug.directive';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
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
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    BreadcrumbModule,
    MatButtonModule,
    MatSidenavModule,
    RouterOutlet,
    AsyncPipe,
    NavItemListComponent,
    ToggleDebugDirective,
  ],
})
export class AppAdminMainComponent implements OnInit, OnDestroy {

  log = classLog({AppAdminMainComponent});

  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<AppAdminMainComponent>,
    private media: MediaMatcher
  ) {
    this.log.a('constructor');
  }

  AppScopes = AppScopes;

  private dialogSettings$ = new BehaviorSubject<DialogSettings>(undefined);
  private pathsArray$ = new BehaviorSubject<string[]>(undefined);
  private currentPath$ = combineLatest([
    this.pathsArray$,
    this.#dialogRouter.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.#dialogRouter.snapshot.firstChild.url[0].path),
      startWith(this.#dialogRouter.snapshot.firstChild.url[0].path)
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
    this.#dialogRouter.doOnDialogClosed(() => this.fetchDialogSettings());

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
  }


  closeDialog() {
    this.dialog.close();
  }

  private fetchDialogSettings() {
    this.#dialogConfigSvc.getCurrent$().subscribe(dialogSettings => {
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
