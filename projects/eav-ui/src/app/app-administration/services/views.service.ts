import { Injectable, Signal } from '@angular/core';
import { transient } from 'projects/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { ViewUsage } from '../models/view-usage.model';
import { View } from '../models/view.model';

const webApiViewDelete = 'admin/view/delete';
const webApiViewImport = 'admin/view/import';
// const webApiViewPolymorph = 'admin/view/polymorphism';
const webApiJson = 'admin/view/json';

export const Polymorphism_DS_ID = 'a495b51f-44e7-4335-81db-b8a7e33120f0'; // Polymorphism DataSource internal ID
@Injectable()
export class ViewsService extends HttpServiceBaseSignal {
  #sysData = transient(SysDataService);

  getAllOnce() {
    const views = this.#sysData.get<View>({ source: 'System.Views', noCamel: true });
    return { value: views };
  }

  getAllLive(refresh: Signal<unknown>) {
    const views = this.#sysData.get<View>({ refresh, source: 'System.Views', noCamel: true });
    return { value: views };
  }

  async delete(id: number): Promise<number> {
    return this.getStatusPromise(webApiViewDelete, {
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

  getUsage(guid: string) {
    const usage = this.#sysData.get<ViewUsage>({
      source: 'System.ViewUsage',
      params: {
        AppId: this.appId,
        ViewGuid: guid,
      },
      noCamel: true,
    });
    return { value: usage };
  }
}
