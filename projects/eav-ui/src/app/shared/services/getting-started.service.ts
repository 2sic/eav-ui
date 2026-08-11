import { inject, Injectable, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { transient } from 'projects/core';
import { filter, first, Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { InstallRule, InstallSettings, InstalledApp } from '../models/installer-models';
import { SysDataService } from './sys-data.service';

interface AppInstallationStreams {
  settings?: { remoteUrl: string }[];
  installedApps?: InstalledApp[];
  rules?: InstallRule[];
}

@Injectable()
export class AppInstallSettingsService {
  #sysData = transient(SysDataService);

  #injector = inject(Injector);
  private installSettingsSubject: Subject<InstallSettings> = new Subject<InstallSettings>();
  settings$: Observable<InstallSettings> = this.installSettingsSubject.asObservable();

  constructor() {
    const ready$ = this.settings$.pipe(
      map(() => true),
      startWith(false));

    ready$.subscribe();
  }

  public loadGettingStarted(isContentApp: boolean): void {
    const resource = this.#sysData.getMany<AppInstallationStreams>({
      source: 'System.AppInstallation',
      streams: '*',
      params: { IsContentApp: isContentApp },
    });
    toObservable(resource.value, { injector: this.#injector }).pipe(
      filter((result): result is AppInstallationStreams => result != null),
      first(),
      map(result => ({
        remoteUrl: result.settings?.[0]?.remoteUrl ?? '',
        installedApps: result.installedApps ?? [],
        rules: result.rules ?? [],
      } satisfies InstallSettings)),
    ).subscribe(settings => this.installSettingsSubject.next(settings));
  }
}