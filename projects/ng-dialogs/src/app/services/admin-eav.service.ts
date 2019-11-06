import { Injectable } from '@angular/core';
import { EavConfiguration } from '../../../../../src/app/shared/models/eav-configuration';
import { UrlHelper } from '../../../../../src/app/shared/helpers/url-helper';

@Injectable()
export class AdminEavService {
  private eavConfig: EavConfiguration;

  constructor() { }

  public setEavConfiguration(hash: string) {
    const queryStringParameters = UrlHelper.readQueryStringParameters(hash);
    console.log('queryStringParameters', queryStringParameters);
    this.eavConfig = UrlHelper.getEavConfiguration(queryStringParameters);
  }

  public getEavConfiguration(): EavConfiguration {
    if (this.eavConfig) {
      return this.eavConfig;
    } else {
      console.log('Configuration data not set');
    }
  }
}
