import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { GlobalConfigService } from '../../../../../edit/shared/services/global-configuration.service';
import { DialogSettings } from '../models/dialog-settings.model';
import { AppDialogConfigService } from '../services/app-dialog-config.service';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
  private dialogSettings$ = new BehaviorSubject<DialogSettings>(null);
  private tabIndex$ = new BehaviorSubject<number>(null);
  templateVars$ = combineLatest([this.dialogSettings$, this.tabIndex$]).pipe(
    map(([dialogSettings, tabIndex]) => ({ dialogSettings, tabIndex })),
  );

  private tabs = ['home', 'data', 'queries', 'views', 'web-api', 'app']; // tabs have to match template and filter below
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    private appDialogConfigService: AppDialogConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private globalConfigService: GlobalConfigService,
  ) { }

  ngOnInit() {
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      if (!dialogSettings.Context.Enable.Query) {
        this.tabs = this.tabs.filter(tab => tab !== 'queries' && tab !== 'web-api');
      }
      this.dialogSettings$.next(dialogSettings);
      this.subscription.add(
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd),
          map(() => this.route.snapshot.firstChild.url[0].path),
          startWith(this.route.snapshot.firstChild.url[0].path),
        ).subscribe(path => {
          const tabIndex = this.tabs.indexOf(path);
          this.tabIndex$.next(tabIndex);
        })
      );
    });
  }

  ngOnDestroy() {
    this.dialogSettings$.complete();
    this.tabIndex$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    const path = this.tabs[event.index];
    this.router.navigate([path], { relativeTo: this.route });
  }

  toggleDebugEnabled(event: MouseEvent) {
    const enableDebugEvent = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.shiftKey && event.altKey;
    if (enableDebugEvent) { this.globalConfigService.toggleDebugEnabled(); }
  }
}
