import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
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
    return this.http.get<View[]>(this.dnnContext.$2sxc.http.apiUrl(webApiViews), {
      params: { appId: this.context.appId.toString() }
    });
  }

  delete(id: number) {
    return this.http.get<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiViewDelete), {
      params: { appId: this.context.appId.toString(), Id: id.toString() },
    });
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<FileUploadResult>(this.dnnContext.$2sxc.http.apiUrl(webApiViewImport), formData, {
      params: { appId: this.context.appId.toString(), zoneId: this.context.zoneId.toString() }
    });
  }

  export(id: number) {
    const url = this.dnnContext.$2sxc.http.apiUrl(webApiViewRoot + 'json')
      + '?appId=' + this.context.appId
      + '&viewId=' + id;

    window.open(url, '_blank', '');
  }

  getPolymorphism() {
    return this.http.get<Polymorphism>(this.dnnContext.$2sxc.http.apiUrl(webApiViewPolymorph), {
      params: { appId: this.context.appId.toString() }
    });
  }

  getUsage(guid: string) {
    return this.http.get<ViewUsage[]>(this.dnnContext.$2sxc.http.apiUrl(webApiViewUsage), {
      params: { appId: this.context.appId.toString(), guid }
    });
  }
}
