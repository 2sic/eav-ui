import { inject, Injectable } from '@angular/core';
import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Context } from '../../shared/services/context';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpServiceBase {

  protected dnnContext = inject(DnnContext);
  protected http = inject(HttpClient);
  protected context = inject(Context);

  constructor() { }

  protected apiUrl(name: string) {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  protected get appId() { return this.context.appId.toString(); }

  protected get zoneId() { return this.context.zoneId.toString(); }
}