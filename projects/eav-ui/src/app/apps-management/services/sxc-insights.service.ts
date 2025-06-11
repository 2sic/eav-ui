import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';

const webApiLogRoot = 'sys/log/';
@Injectable()
export class SxcInsightsService extends HttpServiceBaseSignal {

  activatePageLog(duration: number): Promise<string> {
    return firstValueFrom(
      this.http.get<string>(this.apiUrl(webApiLogRoot + 'EnableDebug'), {
        params: { duration: duration?.toString() },
        responseType: 'text' as 'json'
      })
    );
  }
}
