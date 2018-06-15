import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { UrlHelper } from '../../shared/helpers/url-helper';
import { SvcCreatorService } from '../../shared/services/svc-creator.service';

@Injectable()
export class AdamService {

  // TODO:
  private url; // =  sxc.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field),
  private folders = [];
  private adamRoot; // = appRoot.substr(0, appRoot.indexOf('2sxc'))

  // private contentType;
  // private entityGuid;
  // private field;
  // private subfolder;
  // private serviceConfig;
  // private appRoot;
  // private appId;

  private svcCreatorService;

  constructor(private httpClient: HttpClient,
    private contentType,
    private entityGuid,
    private field,
    private subfolder,
    private serviceConfig,
    private appRoot,
    private appId) {

    // this.contentType = null;
    // this.entityGuid = null;
    // this.field = null;
    // this.subfolder = null;
    // this.serviceConfig = null;

    // tslint:disable-next-line:max-line-length
    this.url = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/app-content/106ba6ed-f807-475a-b004-cd77e6b317bd/131d6a9c-751c-4fca-84e7-46cf67d41413/HyperLinkStaticName';
    this.folders = [];
    this.adamRoot = appRoot.substr(0, appRoot.indexOf('2sxc'));

    // // TEMP:
    // // tslint:disable-next-line:max-line-length
    // this.url = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/app-content/
    // 106ba6ed-f807-475a-b004-cd77e6b317bd/131d6a9c-751c-4fca-84e7-46cf67d41413/HyperLinkStaticName/';
    // sxc.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field),
    // this.adamRoot = appRoot.substr(0, appRoot.indexOf('2sxc'));
    // this.appId = appId;

    // this.svcCreatorService = new SvcCreatorService(this.getAll, 'true');

  }

  // ngOnInit() {
  // }

  // createSvc(contentType, entityGuid, field, subfolder, serviceConfig, appRoot, appId) {



  //   t.disableToastr
  //   t.liveListCache = []; // this is the cached list
  //   t.liveListCache.isLoaded = false;
  //   t.liveList
  //   t._liveListUpdateWithResult
  //     this.svcCreatorService.liveListSourceRead;
  // this.svcCreatorService.liveListReload;
  // this.svcCreatorService.liveListReset;
  // svcliveList = this.svcCreatorService.liveList();

  getAll = () => {
    // TODO:
    const header = UrlHelper.createHeader('89', '421', '421');
    // maybe create model for data

    return this.httpClient.get(this.url + '/items',
      {
        headers: header,
        params: {
          subfolder: this.subfolder,
          usePortalRoot: this.serviceConfig.usePortalRoot,
          appId: this.appId
        }
      })
      .map((data: any) => {
        return data;
      })
      .do(data => console.log('items: ', data))
      .catch(this.handleError);
  }

  // get the correct url for uploading as it is needed by external services (dropzone)
  uploadUrl = (targetSubfolder: string): string => {
    let urlUpl = (targetSubfolder === '')
      ? this.url
      : this.url + '?subfolder=' + targetSubfolder;
    urlUpl += (urlUpl.indexOf('?') === -1 ? '?' : '&')
      + 'usePortalRoot=' + this.serviceConfig.usePortalRoot
      + '&appId=' + this.appId;
    return urlUpl;
  }

  // extend a json-response with a path (based on the adam-root) to also have a fullPath
  addFullPath = (value, key) => {
    // 2dm 2018-03-29 special fix - sometimes the path already has the full path, sometimes not
    // it should actually be resolved properly, but because I don't have time
    // ATM (data comes from different web-services, which are also used in other places
    // I'll just check if it's already in there
    value.fullPath = value.Path;

    if (value.Path && value.Path.toLowerCase().indexOf(this.adamRoot.toLowerCase()) === -1) {
      value.fullPath = this.adamRoot + value.Path;
    }
  }

  // create folder
  addFolder = (newfolder) => {
    // TODO:
    const header = UrlHelper.createHeader('89', '421', '421');
    // maybe create model for data

    return this.httpClient.post(this.url + '/folder',
      {},
      {
        headers: header,
        params: {
          subfolder: this.subfolder,
          newFolder: newfolder,
          usePortalRoot: this.serviceConfig.usePortalRoot,
          appId: this.appId
        }
      })
      .map((data: any) => {
        return data;
      })
      .do(data => console.log('addFolder: ', data))
      .catch(this.handleError);



    // return $http.post(this.url + '/folder',
    //   {},
    //   {
    //     params: {
    //       subfolder: this.subfolder,
    //       newFolder: newfolder,
    //       usePortalRoot: this.serviceConfig.usePortalRoot,
    //       appId: this.appId
    //     }
    //   })
    //   .then(this.liveListReload);
  }

  goIntoFolder = (childFolder): string => {
    this.folders.push(childFolder);
    const pathParts = childFolder.Path.split('/');
    let subPath = '';
    for (let c = 0; c < this.folders.length; c++) {
      subPath = pathParts[pathParts.length - c - 2] + '/' + subPath;
    }
    subPath = subPath.replace('//', '/');
    if (subPath[subPath.length - 1] === '/') {
      subPath = subPath.substr(0, subPath.length - 1);
    }

    childFolder.Subfolder = subPath;

    // now assemble the correct subfolder based on the folders-array
    this.subfolder = subPath;
    // TODO:
    // this.liveListReload();

    return subPath;
  }

  goUp = () => {
    if (this.folders.length > 0) {
      this.folders.pop();
    }
    if (this.folders.length > 0) {
      this.subfolder = this.folders[this.folders.length - 1].Subfolder;
    } else {
      this.subfolder = '';
    }
    // TODO:
    // this.liveListReload();
    return this.subfolder;
  }

  // delete, then reload
  // IF verb DELETE fails, so I'm using get for now
  deleteItem = (item) => {
    // TODO:
    const header = UrlHelper.createHeader('89', '421', '421');

    return this.httpClient.get(this.url + '/delete',
      {
        headers: header,
        params: {
          subfolder: this.subfolder,
          isFolder: item.IsFolder,
          id: item.Id,
          usePortalRoot: this.serviceConfig.usePortalRoot,
          appId: this.appId
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
  }

  // rename, then reload
  rename = (item, newName) => {
    // TODO:
    const header = UrlHelper.createHeader('89', '421', '421');

    return this.httpClient.get(this.url + '/rename',
      {
        headers: header,
        params: {
          subfolder: this.subfolder,
          isFolder: item.IsFolder,
          id: item.Id,
          usePortalRoot: this.serviceConfig.usePortalRoot,
          newName: newName,
          appId: this.appId
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
  }

  //     let svc = {
  //   url,
  //   subfolder,
  //   folders,
  //   adamRoot,
  //   getAll,
  //   uploadUrl,
  //   addFullPath,
  //   addFolder,
  //   goIntoFolder,
  //   goUp,
  //   deleteItem,
  //   rename,
  // }

  // svc = Object.assign(svc, this.svcCreatorService.implementLiveList(getAll, 'true'));


  // TODO:
  // const reload = () => svc.liveListReload();

  //   return svc;
  // }



  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
