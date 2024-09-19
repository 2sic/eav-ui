import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { Context } from '../../shared/services/context';
import { EavEditLoadDto, SaveEavFormData } from '../dialog/main/edit-dialog-main.models';
import { SaveResult } from '../state/save-result.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { classLog } from '../../shared/logging';


const logSpecs = {
  all: false,
  fetchFormData: false,
  saveFormData: false,
};

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class FormDataService {

  log = classLog({FormDataService}, logSpecs);

  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context,
    private globalConfigService: GlobalConfigService,
  ) {
  }

  fetchFormData(items: string) {
    this.log.fnIf('fetchFormData', { items, context: this.context });
    return this.http.post<EavEditLoadDto>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'load'), items, {
      params: { appId: this.context.appId }
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
    return this.http.post<SaveResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'save'), result, {
      params: { appId: this.context.appId, partOfPage }
    });
  }
}
