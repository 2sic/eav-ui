import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith } from 'rxjs';
import { DialogSettings } from '../../app-administration/models';
import { AppDialogConfigService } from '../../app-administration/services';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { Context } from '../../shared/services/context';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';


interface NavItem {
  name: string;
  path: string;
  icon: string;
  tippy: string;
}

const navItems: NavItem[] = [
  { name: 'System', path: 'system', icon: 'settings', tippy: 'System Info' },
  { name: 'Apps', path: 'list', icon: 'star_border', tippy: 'Apps' },
  { name: 'Languages', path: 'languages', icon: 'translate', tippy: 'Languages' },
  { name: 'Extensions / Features', path: 'license', icon: 'tune', tippy: 'Extensions and Features' },
];

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss'],
})
export class AppsManagementNavComponent extends BaseComponent implements OnInit, OnDestroy {

  zoneId = this.context.zoneId;
  dialogSettings$ = new BehaviorSubject<DialogSettings>(undefined);

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
      console.log("x")
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
  navItems = navItems;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    private context: Context,
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
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeUrl(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$(0)/*.getDialogSettings(0)*/.subscribe(dialogSettings => {
      this.dialogSettings$.next(dialogSettings);

      this.pathsArray$.next(this.navItems.map((item) => item.path));

    });
  }
}
