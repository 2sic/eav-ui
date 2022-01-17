import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { SystemInfoSet } from '../models/system-info.model';
import { EnableLanguagesService } from '../services/enable-languages.service';
import { InfoTemplate, SystemInfoTemplateVars } from './system-info.models';

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss'],
})
export class SystemInfoComponent implements OnInit, OnDestroy {
  templateVars$: Observable<SystemInfoTemplateVars>;

  private systemInfoSet$: BehaviorSubject<SystemInfoSet | undefined>;

  constructor(private zoneService: EnableLanguagesService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.systemInfoSet$ = new BehaviorSubject<SystemInfoSet>(undefined);

    this.buildTemplateVars();
    this.getSystemInfo();
  }

  ngOnDestroy(): void {
    this.systemInfoSet$.complete();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  private getSystemInfo(): void {
    this.zoneService.getSystemInfo().subscribe({
      error: () => {
        this.systemInfoSet$.next(undefined);
      },
      next: (systemInfoSet) => {
        this.systemInfoSet$.next(systemInfoSet);
      },
    });
  }

  private buildTemplateVars(): void {
    const systemInfos$ = this.systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        const info: InfoTemplate[] = [
          { label: 'EAV / 2sic Version', value: systemInfoSet.System.EavVersion },
          { label: 'Platform', value: systemInfoSet.System.Platform },
          { label: 'Platform Version', value: systemInfoSet.System.PlatformVersion },
          { label: 'Zones', value: systemInfoSet.System.Zones.toString() },
          { label: 'Fingerprint', value: systemInfoSet.System.Fingerprint },
        ];
        return info;
      })
    );
    const siteInfos$ = this.systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        const info: InfoTemplate[] = [
          { label: 'Zone Id', value: systemInfoSet.Site.ZoneId.toString() },
          { label: 'Site Id', value: systemInfoSet.Site.SiteId.toString() },
          { label: 'Apps', value: systemInfoSet.Site.Apps.toString() },
          { label: 'Languages', value: systemInfoSet.Site.Languages.toString() },
        ];
        return info;
      })
    );
    this.templateVars$ = combineLatest([systemInfos$, siteInfos$]).pipe(
      map(([systemInfos, siteInfos]) => {
        const templateVars: SystemInfoTemplateVars = {
          systemInfos,
          siteInfos,
        };
        return templateVars;
      }),
    );
  }
}
