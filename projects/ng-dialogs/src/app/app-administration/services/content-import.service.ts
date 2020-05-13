import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentImport, ImportContentRequest, EvaluateContentResult, ImportContentResult } from '../models/content-import.model';
import { Context } from '../../shared/services/context';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';

@Injectable()
export class ContentImportService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  async evaluateContent(formValues: ContentImport) {
    const requestData: ImportContentRequest = {
      AppId: this.context.appId.toString(),
      DefaultLanguage: formValues.defaultLanguage,
      ContentType: formValues.contentType,
      ContentBase64: await toBase64(formValues.file),
      ResourcesReferences: formValues.resourcesReferences,
      ClearEntities: formValues.clearEntities,
    };
    return (
      this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ContentImport/EvaluateContent'), requestData)
    ) as Observable<EvaluateContentResult>;
  }

  async importContent(formValues: ContentImport) {
    const requestData: ImportContentRequest = {
      AppId: this.context.appId.toString(),
      DefaultLanguage: formValues.defaultLanguage,
      ContentType: formValues.contentType,
      ContentBase64: await toBase64(formValues.file),
      ResourcesReferences: formValues.resourcesReferences,
      ClearEntities: formValues.clearEntities,
    };
    return (
      this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ContentImport/ImportContent'), requestData)
    ) as Observable<ImportContentResult>;
  }
}
