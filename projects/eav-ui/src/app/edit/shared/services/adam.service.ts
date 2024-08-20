import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdamConfig, AdamItem } from '../../../../../../edit-types';
import { SanitizeHelper } from '../helpers';
import { FormConfigService } from '../../state/form-config.service';
import { LinkInfo } from '../../dialog/main/edit-dialog-main.models';

/**
 * Form wide ADAM helper to get files, add folders etc.
 * Must be created once per edit-form, as it needs the exact app etc.
 */
@Injectable()
export class AdamService {
  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    private formConfig: FormConfigService
  ) { }

  getAll(url: string, config: AdamConfig) {
    return this.http.get<AdamItem[]>(
      url + '/items',
      {
        params: {
          subfolder: config.subfolder,
          usePortalRoot: config.usePortalRoot.toString(),
          appId: this.formConfig.config.appId,
        },
      }
    );
  }

  addFolder(newFolderName: string, url: string, config: AdamConfig) {
    return this.http.post<AdamItem[]>(
      url + '/folder',
      {},
      {
        params: {
          subfolder: config.subfolder,
          newFolder: SanitizeHelper.sanitizeName(newFolderName),
          usePortalRoot: config.usePortalRoot.toString(),
          appId: this.formConfig.config.appId,
        },
      }
    );
  }

  rename(item: AdamItem, newName: string, url: string, config: AdamConfig) {
    return this.http.get<boolean>(
      url + '/rename',
      {
        params: {
          subfolder: config.subfolder,
          isFolder: item.IsFolder.toString(),
          id: item.Id.toString(),
          usePortalRoot: config.usePortalRoot.toString(),
          newName: SanitizeHelper.sanitizeName(newName),
          appId: this.formConfig.config.appId,
        },
      }
    );
  }

  deleteItem(item: AdamItem, url: string, config: AdamConfig) {
    return this.http.get<boolean>(
      url + '/delete',
      {
        params: {
          subfolder: config.subfolder,
          isFolder: item.IsFolder.toString(),
          id: item.Id.toString(),
          usePortalRoot: config.usePortalRoot.toString(),
          appId: this.formConfig.config.appId,
        },
      }
    );
  }

  getLinkInfo(
    link: string,
    contentType: string,
    guid: string,
    field: string
  ): Observable<LinkInfo> {
    return this.http.get<LinkInfo>(
      this.dnnContext.$2sxc.http.apiUrl('cms/edit/linkInfo'),
      {
        params: {
          link,
          ...(guid && { guid }),
          ...(contentType && { contentType }),
          ...(field && { field }),
          appid: this.formConfig.config.appId,
        },
      }
    );
  }
}
