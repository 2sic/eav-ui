
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdamConfig, AdamItem } from '../../../edit-types';
import { EavService } from '../../shared/services/eav.service';
import { SanitizeService } from './sanitize.service';

@Injectable()
export class AdamService {
  constructor(private http: HttpClient, private sanitizeSvc: SanitizeService, private eavService: EavService) { }

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
    return this.http.post(url + '/folder', {}, {
      params: {
        subfolder: config.subfolder,
        newFolder: this.sanitizeSvc.sanitizeName(newfolder),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<AdamItem[]>;
  }

  rename(item: AdamItem, newName: string, url: string, config: AdamConfig) {
    return this.http.get(url + '/rename', {
      params: {
        subfolder: config.subfolder,
        isFolder: item.IsFolder.toString(),
        id: item.Id.toString(),
        usePortalRoot: config.usePortalRoot.toString(),
        newName: this.sanitizeSvc.sanitizeName(newName),
        appId: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<boolean>;
  }

  deleteItem(item: AdamItem, url: string, config: AdamConfig) {
    return this.http.get(url + '/delete', {
      params: {
        subfolder: config.subfolder,
        isFolder: item.IsFolder.toString(),
        id: item.Id.toString(),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<boolean>;
  }

}
