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
import { AppsAdministationNavItems } from './administation-nav-item.mockup';
import { eavConstants } from '../../shared/constants/eav.constants';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss'],
})
export class AppAdministrationNavComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
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
  navItems = AppsAdministationNavItems;

  matcher!: MediaQueryList;

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
    this.matcher = this.media.matchMedia('(min-width: 1000px)');

    this.matcher.addEventListener('change', this.myListener);


    this.fetchDialogSettings();
    this.subscription.add(
      this.refreshOnChildClosedShallow().subscribe(() => {
        this.fetchDialogSettings();
      })
    );



    this.smallScreen.addEventListener(
      'change',
      (c) => (this.sidenav.opened = !c.matches)
    );
  }

  myListener(event: { matches: any; }) {
    console.log(event.matches ? 'match' : 'no match');
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
    if (path === 'data') path = `data/${eavConstants.scopes.default.value}`;
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
