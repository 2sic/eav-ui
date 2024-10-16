import { Injectable } from '@angular/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { HttpServiceBase } from '../../shared/services/http-service-base';
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
export class ViewsService extends HttpServiceBase {

  getAll() {
    return this.getHttpApiUrl<View[]>(webApiViews, {
      params: { appId: this.appId }
    });
  }

  delete(id: number) {
    return this.getHttpApiUrl<boolean>(webApiViewDelete, {
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
    return this.getHttpApiUrl<Polymorphism>(webApiViewPolymorph, {
      params: { appId: this.appId }
    });
  }

  getUsage(guid: string) {
    return this.getHttpApiUrl<ViewUsage[]>(webApiViewUsage, {
      params: { appId: this.appId, guid }
    });
  }
}
