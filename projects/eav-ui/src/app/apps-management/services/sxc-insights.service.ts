import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const webApiLogRoot = 'sys/log/';

@Injectable()
export class SxcInsightsService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  activatePageLog(duration: number) {
    return this.http.get<string>(this.dnnContext.$2sxc.http.apiUrl(webApiLogRoot + 'EnableDebug'), {
      params: { duration: duration.toString() }
    });
  }
}
