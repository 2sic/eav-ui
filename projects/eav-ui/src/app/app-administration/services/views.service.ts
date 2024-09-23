import { Injectable } from '@angular/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { Polymorphism } from '../models/polymorphism.model';
import { ViewUsage } from '../models/view-usage.model';
import { View } from '../models/view.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiViewRoot = 'admin/view/';
const webApiViews = webApiViewRoot + 'all';
const webApiViewDelete = webApiViewRoot + 'delete';
const webApiViewImport = webApiViewRoot + 'import';
const webApiViewPolymorph = webApiViewRoot + 'polymorphism';
const webApiViewUsage = webApiViewRoot + 'usage';

@Injectable()
export class ViewsService extends HttpServiceBase {

  getAll() {
    return this.http.get<View[]>(this.apiUrl(webApiViews), {
      params: { appId: this.appId }
    });
  }

  delete(id: number) {
    return this.http.get<boolean>(this.apiUrl(webApiViewDelete), {
      params: { appId: this.appId, Id: id.toString() },
    });
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<FileUploadResult>(this.apiUrl(webApiViewImport), formData, {
      params: { appId: this.appId, zoneId: this.zoneId }
    });
  }

  export(id: number) {
    const url = this.apiUrl(webApiViewRoot + 'json')
      + '?appId=' + this.appId
      + '&viewId=' + id;

    window.open(url, '_blank', '');
  }

  getPolymorphism() {
    return this.http.get<Polymorphism>(this.apiUrl(webApiViewPolymorph), {
      params: { appId: this.appId }
    });
  }

  getUsage(guid: string) {
    return this.http.get<ViewUsage[]>(this.apiUrl(webApiViewUsage), {
      params: { appId: this.appId, guid }
    });
  }
}
