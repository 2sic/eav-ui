import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Polymorphism } from '../models/polymorphism.model';
import { ViewUsage } from '../models/view-usage.model';
import { View } from '../models/view.model';

const webApiViews = 'admin/view/all';
const webApiViewDelete = 'admin/view/delete';
const webApiViewImport = 'admin/view/import';
const webApiViewPolymorph = 'admin/view/polymorphism';
const webApiViewUsage = 'admin/view/usage';
const webApiJson = 'admin/view/json';


@Injectable()
export class ViewsService extends HttpServiceBase {

  // getAll() {
  //   return this.getSignal<View[]>(webApiViews, {
  //     params: { appId: this.appId }
  //   });
  // }

  getAllOnce() {
    return httpResource<View[]>(() => {
      return ({
        url: this.apiUrl(webApiViews),
        params: { appId: this.appId }
      });
    });
  }

  getAllLive(refresh: Signal<unknown>) {
    return httpResource<View[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiViews),
        params: { appId: this.appId }
      });
    });
  }



// TODO: 2dg, ask 2dm delete with httpResource
  // deleteNew(id: number) {
  //   console.log("2dg id", id)
  //   return httpResource<boolean>(() => ({
  //     url: this.apiUrl(webApiViewDelete),
  //     params: { appId: this.appId, Id: id.toString() }
  //   }));
  // }

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
    const url = this.apiUrl(webApiJson)
      + '?appId=' + this.appId
      + '&viewId=' + id;
    window.open(url, '_blank', '');
  }

  getPolymorphism() {
    return this.getSignal<Polymorphism>(webApiViewPolymorph, {
      params: { appId: this.appId }
    });
  }

  getUsage(guid: string) {
    return this.getSignal<ViewUsage[]>(webApiViewUsage, {
      params: { appId: this.appId, guid }
    });
  }

}
