import { of } from 'rxjs';

import { switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InstallPackage } from '../models/installer-models';

@Injectable()
// copied from 2sxc-ui
export class InstallerService {

  constructor(
    private http: HttpClient
  ) { }

  installPackages(packages: InstallPackage[], step: (p: InstallPackage) => void): Observable<any> {
    return packages.reduce(
      (t: Observable<Response>, c) => t.pipe(
        switchMap(() => {
          if (!c.url) return of(true);
          step(c);
          return <Observable<any>>this.http.post(`sys/install/RemotePackage?packageUrl=${c.url}`, {});
        })),
      of(true));
  }
}