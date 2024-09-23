import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { EavEditLoadDto, SaveEavFormData } from '../dialog/main/edit-dialog-main.models';
import { SaveResult } from '../state/save-result.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { classLog } from '../../shared/logging';
import { HttpServiceBase } from '../../shared/services/http-service-base';


const logSpecs = {
  all: false,
  fetchFormData: false,
  saveFormData: false,
};

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class FormDataService extends HttpServiceBase {

  log = classLog({FormDataService}, logSpecs);

  constructor(
    private globalConfigService: GlobalConfigService,
  ) {
    super();
  }

  fetchFormData(items: string) {
    this.log.fnIf('fetchFormData', { items, context: this.context });
    return this.http.post<EavEditLoadDto>(this.apiUrl(webApiEditRoot + 'load'), items, {
      params: { appId: this.appId }
    }).pipe(
      map(formData => {
        formData.Context.Language.List = formData.Context.Language.List.filter(language => language.IsEnabled);
        return formData;
      }),
      tap(formData => {
        this.globalConfigService.allowDebug(formData.Context.Enable.DebugMode);
      }),
    );
  }

  saveFormData(result: SaveEavFormData, partOfPage: string) {
    this.log.fnIf('saveFormData', { result, partOfPage });
    return this.http.post<SaveResult>(this.apiUrl(webApiEditRoot + 'save'), result, {
      params: { appId: this.appId, partOfPage }
    });
  }
}
