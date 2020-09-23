import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Context } from '../../shared/services/context';
import { Polymorphism } from '../models/polymorphism.model';
import { ViewUsage } from '../models/view-usage.model';
import { View } from '../models/view.model';

const webApiViewRoot = 'admin/view/';
const webApiViews = webApiViewRoot + 'all';
const webApiViewDelete = webApiViewRoot + 'delete';
const webApiViewImport = webApiViewRoot + 'import';
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

  import(file: File) {
    return from(toBase64(file)).pipe(
      mergeMap(fileBase64 => {
        return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiViewImport), {
          AppId: this.context.appId.toString(),
          ContentBase64: fileBase64,
        }) as Observable<boolean>;
      })
    );
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
