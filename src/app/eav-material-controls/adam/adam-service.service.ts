import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AdamService {

  // TODO:
  private url; // =  sxc.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field),
  private folders = [];
  private adamRoot; // = appRoot.substr(0, appRoot.indexOf('2sxc'))


  constructor(private httpClient: HttpClient,
    private contentType: any,
    private entityGuid: any,
    private field: any,
    private subfolder: any,
    private serviceConfig: any,
    private appRoot: any) {
    this.contentType = contentType;
    this.entityGuid = entityGuid;
    this.field = field;
    this.subfolder = subfolder;
    this.serviceConfig = serviceConfig;

    this.url = ''; // sxc.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field),
    this.adamRoot = appRoot.substr(0, appRoot.indexOf('2sxc'));
  }







}
