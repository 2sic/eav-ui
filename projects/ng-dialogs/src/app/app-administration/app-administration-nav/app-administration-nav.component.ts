import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { eavConstants } from '../../shared/constants/eav.constants';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss'],
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
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
  templateVars$ = combineLatest([this.dialogSettings$, this.tabIndex$]).pipe(
    map(([dialogSettings, tabIndex]) => ({ dialogSettings, tabIndex })),
  );

  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fetchDialogSettings();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    this.tabs$.complete();
    this.subscription.unsubscribe();
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

  private fetchDialogSettings() {
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      UpdateEnvVarsFromDialogSettings(dialogSettings.Context.App);
      this.dialogSettings$.next(dialogSettings);

      let tabs = ['home', 'data', 'queries', 'views', 'web-api', 'app']; // tabs order has to match template
      if (!dialogSettings.Context.Enable.Query) {
        tabs = tabs.filter(tab => tab !== 'queries' && tab !== 'web-api');
      }
      this.tabs$.next(tabs);
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchDialogSettings();
      })
    );
  }
}
