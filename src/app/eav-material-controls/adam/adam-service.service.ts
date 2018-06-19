import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { UrlHelper } from '../../shared/helpers/url-helper';
import { SvcCreatorService } from '../../shared/services/svc-creator.service';
import { AdamItem } from '../../shared/models/adam/adam-item';

@Injectable()
export class AdamService {

  // TODO:
  private url; // =  sxc.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field),
  // private folders = [];
  private adamRoot; // = appRoot.substr(0, appRoot.indexOf('2sxc'))

  private contentType;
  private entityGuid;
  private field;
  private subfolder;
  private serviceConfig;
  private appRoot;
  private appId;

  constructor(private httpClient: HttpClient, private svcCreatorService: SvcCreatorService) {
    // private contentType: any,
    // private entityGuid: any,
    // private field: any,
    // private subfolder: any,
    // private serviceConfig: any,
    // private appRoot: any,
    // private appId: any)

    this.contentType = null;
    this.entityGuid = null;
    this.field = null;
    // this.subfolder = '';
    // this.serviceConfig = null;

    // // TEMP:
    // // tslint:disable-next-line:max-line-length
    // this.url = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/app-content/
    // 106ba6ed-f807-475a-b004-cd77e6b317bd/131d6a9c-751c-4fca-84e7-46cf67d41413/HyperLinkStaticName/';
    // sxc.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field),
    // this.adamRoot = appRoot.substr(0, appRoot.indexOf('2sxc'));
    // this.appId = appId;
  }

  createSvc(contentType, entityGuid, field, subfolder, serviceConfig, appRoot, appId) {
    // tslint:disable-next-line:max-line-length
    // const url = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/app-content/106ba6ed-f807-475a-b004-cd77e6b317bd/131d6a9c-751c-4fca-84e7-46cf67d41413/HyperLinkStaticName';
    // tslint:disable-next-line:max-line-length
    const url = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/app-content/106ba6ed-f807-475a-b004-cd77e6b317bd/7fb41a4e-e832-42f5-9ece-f37c368dd9ee/HyperLinkStaticName/';
    const folders = [];
    // TODO: change:
    const adamRoot = appRoot; // appRoot.substr(0, appRoot.indexOf('2sxc'));

    const getAll = (): Observable<AdamItem[]> => {

      console.log('GET ALL subfolder:', subfolder);
      // TODO:
      const header = UrlHelper.createHeader('89', '421', '421');
      // maybe create model for data
      return this.httpClient.get(url + '/items',
        {
          headers: header,
          params: {
            subfolder: subfolder,
            usePortalRoot: serviceConfig.usePortalRoot,
            appId: appId
          }
        })
        .map((data: any) => {
          console.log('geta all before', data);
          data.forEach(addFullPath);
          console.log('geta all after', data);
          return data;
        })
        .do(data => console.log('items subfolder: ', subfolder))
        .catch(this.handleError);
    };

    // get the correct url for uploading as it is needed by external services (dropzone)
    const uploadUrl = (targetSubfolder: string): string => {
      let urlUpl = (targetSubfolder === '')
        ? url
        : url + '?subfolder=' + targetSubfolder;
      urlUpl += (urlUpl.indexOf('?') === -1 ? '?' : '&')
        + 'usePortalRoot=' + serviceConfig.usePortalRoot
        + '&appId=' + appId;
      return urlUpl;
    };

    // extend a json-response with a path (based on the adam-root) to also have a fullPath
    const addFullPath = (value: AdamItem, key) => {
      // 2dm 2018-03-29 special fix - sometimes the path already has the full path, sometimes not
      // it should actually be resolved properly, but because I don't have time
      // ATM (data comes from different web-services, which are also used in other places
      // I'll just check if it's already in there
      value.FullPath = value.Path;
      console.log('geta all adamRoot', adamRoot);
      if (value.Path && value.Path.toLowerCase().indexOf(adamRoot.toLowerCase()) === -1) {
        console.log('geta all value.Path.toLowerCase()', value.Path.toLowerCase().indexOf(adamRoot.toLowerCase()) === -1);
        value.FullPath = adamRoot + value.Path;
      }
      console.log('geta all 1', value);
    };

    // create folder
    const addFolder = (newfolder) => {
      // TODO:
      const header = UrlHelper.createHeader('89', '421', '421');
      // maybe create model for data
      return this.httpClient.post(url + '/folder',
        {},
        {
          headers: header,
          params: {
            subfolder: subfolder,
            newFolder: newfolder,
            usePortalRoot: serviceConfig.usePortalRoot,
            appId: appId
          }
        })
        .map((data: any) => {
          return data;
        })
        .do(data => console.log('addFolder: ', data))
        .catch(this.handleError);
    };

    const goIntoFolder = (childFolder): string => {
      folders.push(childFolder);
      console.log('goIntoFolder childFolder: ', childFolder);
      const pathParts = childFolder.Path.split('/');
      let subPath = '';
      console.log('goIntoFolder pathParts: ', pathParts);
      console.log('goIntoFolder folders: ', folders);
      console.log('goIntoFolder this.folders.length: ', folders.length);
      // for (let c = 0; c < folders.length; c++) {
      //   subPath = pathParts[pathParts.length - c - 2] + '/' + subPath;
      //   console.log('goIntoFolder subPath for: ', subPath);
      // }

      for (let index = 0; index < folders.length; index++) {
        console.log('goIntoFolder start: ', subPath);
        subPath = pathParts[pathParts.length - index - 2] + '/' + subPath;
        console.log('goIntoFolder subPath for: ', subPath);
      }
      subPath = subPath.replace('//', '/');
      if (subPath[subPath.length - 1] === '/') {
        subPath = subPath.substr(0, subPath.length - 1);
      }

      childFolder.Subfolder = subPath;
      console.log('goIntoFolder: ', subPath);
      // now assemble the correct subfolder based on the folders-array
      subfolder = subPath;
      // TODO:
      // this.liveListReload();

      return subPath;
    };

    const goUp = () => {
      if (folders.length > 0) {
        folders.pop();
      }
      if (folders.length > 0) {
        subfolder = folders[folders.length - 1].Subfolder;
      } else {
        subfolder = '';
      }
      // TODO:
      // this.liveListReload();
      return subfolder;
    };

    // delete, then reload
    // IF verb DELETE fails, so I'm using get for now
    const deleteItem = (item) => {
      // TODO:
      const header = UrlHelper.createHeader('89', '421', '421');
      return this.httpClient.get(url + '/delete',
        {
          headers: header,
          params: {
            subfolder: subfolder,
            isFolder: item.IsFolder,
            id: item.Id,
            usePortalRoot: serviceConfig.usePortalRoot,
            appId: appId
          }
        })
        .map((data: any) => {
          return data;
        })
        .do(data => console.log('delete: ', data))
        .catch(this.handleError);

      // return $http.get(this.url + '/delete',
      //   {
      //     params: {
      //       subfolder: this.subfolder,
      //       isFolder: item.IsFolder,
      //       id: item.Id,
      //       usePortalRoot: this.serviceConfig.usePortalRoot,
      //       appId: this.appId
      //     }
      //   })
      //   .then(this.liveListReload);
    };

    // rename, then reload
    const rename = (item, newName) => {
      // TODO:
      const header = UrlHelper.createHeader('89', '421', '421');
      return this.httpClient.get(url + '/rename',
        {
          headers: header,
          params: {
            subfolder: subfolder,
            isFolder: item.IsFolder,
            id: item.Id,
            usePortalRoot: serviceConfig.usePortalRoot,
            newName: newName,
            appId: appId
          }
        })
        .map((data: any) => {
          return data;
        })
        .do(data => console.log('rename: ', data))
        .catch(this.handleError);

      // return $http.get(this.url + '/rename',
      //   {
      //     params: {
      //       subfolder: this.subfolder,
      //       isFolder: item.IsFolder,
      //       id: item.Id,
      //       usePortalRoot: this.serviceConfig.usePortalRoot,
      //       newName: newName,
      //       appId: this.appId
      //     }
      //   })
      //   .then(this.liveListReload);
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
    };

    svc = Object.assign(svc, this.svcCreatorService.implementLiveList(getAll, 'true'));

    // TODO:
    // const reload = () => svc.liveListReload();

    return svc;
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
