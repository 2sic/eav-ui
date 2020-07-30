
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AdamItem, AdamConfig, AdamPostResponse } from '../../../edit-types';
import { SanitizeService } from './sanitize.service';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';

@Injectable()
export class AdamService {
  constructor(private http: HttpClient, private sanitizeSvc: SanitizeService, private context: Context) { }

  getAll(url: string, config: AdamConfig) {
    return (this.http.get(url + '/items', {
      params: {
        subfolder: config.subfolder,
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.context.appId.toString(),
      }
    }) as Observable<AdamItem[]>)
      .pipe(
        map(items => {
          // items can be null if folder isn't created when user doesn't have required access rights,
          // e.g. public (not loggen in) user
          if (items == null) { return items; }
          for (const item of items) {
            this.addFullPath(item);
          }
          return items;
        }),
      );
  }

  /** Calculates full URL to an item */
  addFullPath(item: AdamItem | AdamPostResponse) {
    const adamRoot = this.context.appRoot.substring(0, this.context.appRoot.indexOf('2sxc'));
    item.FullPath = item.Path;
    if (!item.Path?.toLowerCase().includes(adamRoot.toLowerCase())) {
      item.FullPath = adamRoot + item.Path;
    }
  }

  addFolder(newfolder: string, url: string, config: AdamConfig) {
    return this.http.post(url + '/folder', {}, {
      params: {
        subfolder: config.subfolder,
        newFolder: this.sanitizeSvc.sanitizeName(newfolder),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.context.appId.toString(),
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
        appId: this.context.appId.toString(),
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
        appId: this.context.appId.toString(),
      }
    }) as Observable<boolean>;
  }

}
