import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiLogRoot = 'sys/log/';

@Injectable()
export class SxcInsightsService extends HttpServiceBase {

  activatePageLog(duration: number) {
    return this.getHttp<string>(webApiLogRoot + 'EnableDebug', {
      params: { duration: duration.toString() }
    });
  }
}
