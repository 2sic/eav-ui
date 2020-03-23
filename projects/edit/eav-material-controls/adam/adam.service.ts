
import { throwError, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SvcCreatorService } from '../../shared/services/svc-creator.service';
import { AdamItem } from '../../shared/models/adam/adam-item';
import { EavService } from '../../shared/services/eav.service';
import { EavConfiguration } from '../../shared/models/eav-configuration';
import { SanitizeService } from './sanitize.service';

@Injectable()
export class AdamService {
  private eavConfig: EavConfiguration;

  constructor(
    private httpClient: HttpClient,
    private svcCreatorService: SvcCreatorService,
    private eavService: EavService,
    private sanitizeSvc: SanitizeService
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  createSvc(subfolder: string, serviceConfig: any, url: string) {
    const folders: AdamItem[] = [];
    const adamRoot = this.eavConfig.approot.substr(0, this.eavConfig.approot.indexOf('2sxc'));
    const startingSubfolder = subfolder;
    let allowEdit: boolean;

    const getAllowEdit = () => allowEdit;

    const checkAllowEdit = (items: AdamItem[]) => {
      const currentFolder = items.find(item => item.Name === '.');
      if (currentFolder) {
        allowEdit = currentFolder.AllowEdit;
      } else {
        // currentFolder missing
        allowEdit = false;
      }
    };

    // extend a json-response with a path (based on the adam-root) to also have a fullPath
    const addFullPath = (value: AdamItem, key: any) => {
      // 2dm 2018-03-29 special fix - sometimes the path already has the full path, sometimes not
      // it should actually be resolved properly, but because I don't have time
      // ATM (data comes from different web-services, which are also used in other places
      // I'll just check if it's already in there
      value.FullPath = value.Path;
      if (value.Path && value.Path.toLowerCase().indexOf(adamRoot.toLowerCase()) === -1) {
        value.FullPath = adamRoot + value.Path;
      }
    };

    // create folder
    const addFolder = (newfolder: string) => {
      return this.httpClient.post(url + '/folder',
        {},
        {
          params: {
            subfolder,
            newFolder: this.sanitizeSvc.sanitizeName(newfolder),
            usePortalRoot: serviceConfig.usePortalRoot,
            appId: this.eavConfig.appId
          }
        })
        .pipe(
          map((data: any) => {
            reload();
            return data;
          }),
          tap(data => console.log('addFolder: ', data)),
          catchError(error => this.handleError(error))
        );
    };

    const goIntoFolder = (childFolder: AdamItem): string => {
      folders.push(childFolder);
      const pathParts = childFolder.Path.split('/');
      let subPath = '';
      for (let i = 0; i < folders.length; i++) {
        subPath = pathParts[pathParts.length - i - 2] + '/' + subPath;
      }
      subPath = subPath.replace('//', '/');
      if (subPath[subPath.length - 1] === '/') {
        subPath = subPath.substr(0, subPath.length - 1);
        subPath = (!!startingSubfolder) ? startingSubfolder + '/' + subPath : subPath;
      }

      childFolder.Subfolder = subPath;
      // now assemble the correct subfolder based on the folders-array
      subfolder = subPath;

      reload();

      return subPath;
    };

    const goUp = () => {
      if (folders.length > 0) {
        folders.pop();
      }
      if (folders.length > 0) {
        subfolder = folders[folders.length - 1].Subfolder;
      } else {
        subfolder = startingSubfolder || '';
      }
      reload();
      return subfolder;
    };

    const getAll = (): Observable<AdamItem[]> => {
      console.log('GET ALL subfolder:', subfolder);
      return this.httpClient.get(url + '/items',
        {
          params: {
            subfolder,
            usePortalRoot: serviceConfig.usePortalRoot,
            appId: this.eavConfig.appId
          }
        })
        .pipe(
          map((data: any) => {
            // items can be null if folder isn't created when user doesn't have required access rights,
            // e.g. public (not loggen in) user
            if (data === null || data === undefined) { return data; }
            data.forEach(addFullPath);
            checkAllowEdit(data);
            return data;
          }),
          tap(data => console.log('items subfolder: ', subfolder)),
          catchError(error => this.handleError(error))
        );
    };

    // delete, then reload
    // IF verb DELETE fails, so I'm using get for now
    const deleteItem = (item: AdamItem) => {
      return this.httpClient.get(url + '/delete',
        {
          params: {
            subfolder,
            isFolder: item.IsFolder.toString(),
            id: item.Id.toString(),
            usePortalRoot: serviceConfig.usePortalRoot,
            appId: this.eavConfig.appId,
          }
        })
        .pipe(
          map((data: any) => {
            reload();
            return data;
          }),
          // tap(data => console.log('delete: ', data))),
          catchError(error => this.handleError(error))
        );
    };

    // rename, then reload
    const rename = (item: AdamItem, newName: string) => {
      return this.httpClient.get(url + '/rename',
        {
          params: {
            subfolder,
            isFolder: item.IsFolder.toString(),
            id: item.Id.toString(),
            usePortalRoot: serviceConfig.usePortalRoot,
            newName: this.sanitizeSvc.sanitizeName(newName),
            appId: this.eavConfig.appId,
          }
        })
        .pipe(
          map((data: any) => {
            reload();
            return data;
          }),
          // tap(data => console.log('rename: ', data)),
          catchError(error => this.handleError(error))
        );
    };

    // get the correct url for uploading as it is needed by external services (dropzone)
    const uploadUrl = (targetSubfolder: string): string => {
      targetSubfolder = this.sanitizeSvc.sanitizePath(targetSubfolder);
      let urlUpl = (targetSubfolder === '')
        ? url
        : url + '?subfolder=' + targetSubfolder;
      urlUpl += (urlUpl.indexOf('?') === -1 ? '?' : '&')
        + 'usePortalRoot=' + serviceConfig.usePortalRoot
        + '&appId=' + this.eavConfig.appId;
      return urlUpl;
    };

    let svc = {
      url,
      subfolder,
      folders,
      adamRoot,
      getAll,
      uploadUrl,
      addFullPath,
      addFolder,
      goIntoFolder,
      goUp,
      deleteItem,
      rename,
      liveListReload: null as any,
      getAllowEdit,
    };

    svc = Object.assign(svc, this.svcCreatorService.implementLiveList(getAll, 'true'));

    const reload = () => svc.liveListReload();

    return svc;
  }

  private handleError(error: Error) {
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
