import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdamConfig } from '../../../../../../edit-types/src/AdamConfig';
import { AdamItem } from '../../../../../../edit-types/src/AdamItem';
import { HttpServiceBase } from '../../../shared/services/http-service-base';
import { LinkInfo } from '../../dialog/main/edit-dialog-main.models';
import { FormConfigService } from '../../form/form-config.service';
import { SanitizeHelper } from '../helpers';

/**
 * Form wide ADAM helper to get files, add folders etc.
 * Must be created once per edit-form, as it needs the exact app etc.
 */
@Injectable()
export class AdamService extends HttpServiceBase {

  constructor(private formConfig: FormConfigService) {
    super();
  }

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
      this.apiUrl('cms/edit/linkInfo'),
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
