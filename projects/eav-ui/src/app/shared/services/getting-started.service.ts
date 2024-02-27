
import { startWith, map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { InstallSettings } from '../models/installer-models';

@Injectable()
// copied from 2sxc-ui
export class AppInstallSettingsService {

  private installSettingsSubject: Subject<InstallSettings> = new Subject<InstallSettings>();
  settings$: Observable<InstallSettings> = this.installSettingsSubject.asObservable();

  constructor(private http: HttpClient) {
    const ready$ = this.settings$.pipe(
      map(() => true),
      startWith(false));

    ready$.subscribe();
  }

  public loadGettingStarted(isContentApp: boolean): void {
    this.http.get<InstallSettings>(`sys/install/InstallSettings?isContentApp=${isContentApp}`)
      .subscribe(json => this.installSettingsSubject.next(json));
  }
}
