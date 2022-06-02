import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EavService } from '.';
import { AdamConfig, AdamItem } from '../../../../../../edit-types';
import { SanitizeHelper } from '../helpers';
import { LinkInfo } from '../models';

@Injectable()
export class AdamService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private eavService: EavService) { }

  getAll(url: string, config: AdamConfig) {
    return this.http.get<AdamItem[]>(url + '/items', {
      params: {
        subfolder: config.subfolder,
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId,
      }
    });
  }

  addFolder(newfolder: string, url: string, config: AdamConfig) {
    return this.http.post<AdamItem[]>(url + '/folder', {}, {
      params: {
        subfolder: config.subfolder,
        newFolder: SanitizeHelper.sanitizeName(newfolder),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId,
      }
    });
  }

  rename(item: AdamItem, newName: string, url: string, config: AdamConfig) {
    return this.http.get<boolean>(url + '/rename', {
      params: {
        subfolder: config.subfolder,
        isFolder: item.IsFolder.toString(),
        id: item.Id.toString(),
        usePortalRoot: config.usePortalRoot.toString(),
        newName: SanitizeHelper.sanitizeName(newName),
        appId: this.eavService.eavConfig.appId,
      }
    });
  }

  deleteItem(item: AdamItem, url: string, config: AdamConfig) {
    return this.http.get<boolean>(url + '/delete', {
      params: {
        subfolder: config.subfolder,
        isFolder: item.IsFolder.toString(),
        id: item.Id.toString(),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId,
      }
    });
  }

  getLinkInfo(link: string, contentType: string, guid: string, field: string): Observable<LinkInfo> {
    return this.http.get<LinkInfo>(this.dnnContext.$2sxc.http.apiUrl('cms/edit/linkInfo'), {
      params: {
        link,
        ...(guid && { guid }),
        ...(contentType && { contentType }),
        ...(field && { field }),
        appid: this.eavService.eavConfig.appId,
      }
    });
  }
}
