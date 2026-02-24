import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { classLog } from '../../../../../shared/logging';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { EavEditLoadDto, SaveEavFormData } from '../dialog/main/edit-dialog-main.models';
import { SaveResult } from '../state/save-result.model';


const logSpecs = {
  all: false,
  fetchFormData: false,
  saveFormData: false,
};

const webApiLoad = 'cms/edit/load';
const webApiSave = 'cms/edit/save';

@Injectable()
export class FormDataService extends HttpServiceBaseSignal {

  log = classLog({FormDataService}, logSpecs);

  constructor(
    private globalConfigService: GlobalConfigService,
  ) {
    super();
  }

  fetchFormData(items: string) {
    this.log.fnIf('fetchFormData', { items, context: this.context });
    return this.http.post<EavEditLoadDto>(this.apiUrl(webApiLoad), items, {
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
    return this.http.post<SaveResult>(this.apiUrl(webApiSave), result, {
      params: { appId: this.appId, partOfPage }
    });
  }
}
