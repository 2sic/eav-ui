import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { combineLatest, filter, map, startWith } from 'rxjs';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { Context } from '../../shared/services/context';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppDialogConfigService } from '../../app-administration/services';
import { AppsManagementNavItems } from './managment-nav-item.mockup';

// const navItems: NavItem[] = [
//   {
//     name: 'System', path: 'system', icon: 'settings', tippy: 'System Info', child: [
//       { name: 'Register', path: 'registration', icon: 'how_to_reg', tippy: 'Register this System on 2sxc Patrons' },
//     ]
//   },
//   { name: 'Apps', path: 'list', icon: 'star_border', tippy: 'Apps' },
//   { name: 'Languages', path: 'languages', icon: 'translate', tippy: 'Languages' },
//   { name: 'Extensions / Features', path: 'license', icon: 'tune', tippy: 'Extensions and Features' },
// ];

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss'],
})
export class AppsManagementNavComponent extends BaseComponent implements OnInit, OnDestroy {

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
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeUrl(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$(0).subscribe();
  }

}
