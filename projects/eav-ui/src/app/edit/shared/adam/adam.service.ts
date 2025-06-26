import { Injectable } from '@angular/core';
import { AdamConfig } from '../../../../../../edit-types/src/AdamConfig';
import { AdamItem } from '../../../../../../edit-types/src/AdamItem';
import { HttpServiceBaseSignal } from '../../../shared/services/http-service-base-signal';
import { LinkInfo } from '../../dialog/main/edit-dialog-main.models';
import { FormConfigService } from '../../form/form-config.service';
import { SanitizeHelper } from '../helpers';

/**
 * Form wide ADAM helper to get files, add folders etc.
 * Must be created once per edit-form, as it needs the exact app etc.
 */
@Injectable()
export class AdamService extends HttpServiceBaseSignal {

  constructor(private formConfig: FormConfigService) {
    super();
  }

  getAllPromise(url: string, config: AdamConfig): Promise<AdamItem[]> {
    return this.fetchPromise<AdamItem[]>(url + '/items', {
      params: {
        subfolder: config.subfolder,
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.formConfig.config.appId,
      },
    });
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

  renamePromise(item: AdamItem, newName: string, url: string, config: AdamConfig): Promise<boolean> {
    return this.fetchPromise<boolean>(url + '/rename', {
      params: {
        subfolder: config.subfolder,
        isFolder: item.IsFolder.toString(),
        id: item.Id.toString(),
        usePortalRoot: config.usePortalRoot.toString(),
        newName: SanitizeHelper.sanitizeName(newName),
        appId: this.formConfig.config.appId,
      },
    });
  }

  deleteItemPromise(item: AdamItem, url: string, config: AdamConfig): Promise<boolean> {
    return this.fetchPromise<boolean>(url + '/delete', {
      params: {
        subfolder: config.subfolder,
        isFolder: item.IsFolder.toString(),
        id: item.Id.toString(),
        usePortalRoot: config.usePortalRoot.toString(),
        appId: this.formConfig.config.appId,
      },
    });
  }

  getLinkInfoPromise(
    link: string,
    contentType: string,
    guid: string,
    field: string
  ): Promise<LinkInfo> {
    return this.fetchPromise<LinkInfo>('cms/edit/linkInfo', {
      params: {
        link,
        ...(guid && { guid }),
        ...(contentType && { contentType }),
        ...(field && { field }),
        appid: this.formConfig.config.appId,
      },
    });
  }


}
