import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { first, Observable, Subject, switchMap } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DialogConfigGlobalService } from '../../app-administration/services/dialog-config-global.service';
import { InstallRule, InstallSettings, InstalledApp } from '../models/installer-models';
import { Context } from './context';

interface AppInstallationStreams {
  settings?: { remoteUrl: string }[];
  installedApps?: InstalledApp[];
  rules?: InstallRule[];
}

@Injectable()
export class AppInstallSettingsService {
  #context = inject(Context);
  #dialogConfig = inject(DialogConfigGlobalService);
  #http = inject(HttpClient);

  private installSettingsSubject: Subject<InstallSettings> = new Subject<InstallSettings>();
  settings$: Observable<InstallSettings> = this.installSettingsSubject.asObservable();

  constructor() {
    const ready$ = this.settings$.pipe(
      map(() => true),
      startWith(false));

    ready$.subscribe();
  }

  public loadGettingStarted(isContentApp: boolean): void {
    this.#dialogConfig.getShared$(this.#context.appId).pipe(
      first(),
      switchMap(settings => this.#http.get<AppInstallationStreams>('app/auto/query/System.SysData/', {
        params: {
          appId: this.#context.appId || settings.Context.Site.PrimaryApp.AppId,
          SysDataSource: 'System.AppInstallation',
          '$casing': 'camel',
          IsContentApp: isContentApp,
        },
      })),
      map(result => ({
        remoteUrl: result.settings?.[0]?.remoteUrl ?? '',
        installedApps: result.installedApps ?? [],
        rules: result.rules ?? [],
      } satisfies InstallSettings)),
    ).subscribe(settings => this.installSettingsSubject.next(settings));
  }
}