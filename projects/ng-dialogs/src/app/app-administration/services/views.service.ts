import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../shared/services/context';
import { Polymorphism } from '../models/polymorphism.model';
import { ViewUsage } from '../models/view-usage.model';
import { View } from '../models/view.model';

const webApiViewRoot = 'admin/view/';
const webApiViews = webApiViewRoot + 'all';
const webApiViewDelete = webApiViewRoot + 'delete';
const webApiViewPolymorph = webApiViewRoot + 'polymorphism';
const webApiViewUsage = webApiViewRoot + 'usage';

@Injectable()
export class ViewsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiViews), {
      params: { appId: this.context.appId.toString() }
    }) as Observable<View[]>;
  }

  delete(id: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiViewDelete), {
      params: { appId: this.context.appId.toString(), Id: id.toString() },
    }) as Observable<boolean>;
  }

  getPolymorphism() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiViewPolymorph), {
      params: { appId: this.context.appId.toString() }
    }) as Observable<Polymorphism>;
  }

  getUsage(guid: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiViewUsage), {
      params: { appId: this.context.appId.toString(), guid }
    }) as Observable<ViewUsage[]>;
  }
}
