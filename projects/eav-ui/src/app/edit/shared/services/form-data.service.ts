import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { Context } from '../../../shared/services/context';
import { EavEditLoadDto, SaveEavFormData } from '../../dialog/main/edit-dialog-main.models';
import { SaveResult } from '../models';
import { GlobalConfigService } from '../store/ngrx-data';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = true;
const nameOfThis = 'FormDataService';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class FormDataService extends ServiceBase {
  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context,
    private globalConfigService: GlobalConfigService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  fetchFormData(items: string) {
    this.log.a('fetchFormData', { items, context: this.context });
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
    return this.http.post<SaveResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'save'), result, {
      params: { appId: this.context.appId, partOfPage }
    });
  }
}
