
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdamConfig, AdamItem } from '../../../edit-types';
import { EavService } from '../../shared/services/eav.service';
import { SanitizeHelper } from './sanitize.helper';

@Injectable()
export class AdamService {
  constructor(private http: HttpClient, private eavService: EavService) { }

  getAll(url: string, config: AdamConfig) {
    return this.http.get<AdamItem[]>(url + '/items', {
      params: {
        subfolder: config.subfolder,
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId.toString(),
      }
    });
  }

  addFolder(newfolder: string, url: string, config: AdamConfig) {
    return this.http.post<AdamItem[]>(url + '/folder', {}, {
      params: {
        subfolder: config.subfolder,
        newFolder: SanitizeHelper.sanitizeName(newfolder),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId.toString(),
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
        appId: this.eavService.eavConfig.appId.toString(),
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
        appId: this.eavService.eavConfig.appId.toString(),
      }
    });
  }

}
