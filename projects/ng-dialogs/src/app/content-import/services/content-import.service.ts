import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { webApiEntityRoot } from '../../../../../edit/shared/services/entity.service';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Context } from '../../shared/services/context';
import { ContentImport, EvaluateContentResult, ImportContentRequest, ImportContentResult } from '../models/content-import.model';

@Injectable()
export class ContentImportService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  evaluateContent(formValues: ContentImport) {
    return from(toBase64(formValues.file)).pipe(
      mergeMap(fileBase64 => {
        const requestData: ImportContentRequest = {
          AppId: this.context.appId.toString(),
          DefaultLanguage: formValues.defaultLanguage,
          ContentType: formValues.contentType,
          ContentBase64: fileBase64,
          ResourcesReferences: formValues.resourcesReferences,
          ClearEntities: formValues.clearEntities,
        };
        return (
          this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'XmlPreview'), requestData)
        ) as Observable<EvaluateContentResult>;
      })
    );
  }

  importContent(formValues: ContentImport) {
    return from(toBase64(formValues.file)).pipe(
      mergeMap(fileBase64 => {
        const requestData: ImportContentRequest = {
          AppId: this.context.appId.toString(),
          DefaultLanguage: formValues.defaultLanguage,
          ContentType: formValues.contentType,
          ContentBase64: fileBase64,
          ResourcesReferences: formValues.resourcesReferences,
          ClearEntities: formValues.clearEntities,
        };
        return (
          this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'XmlUpload'), requestData)
        ) as Observable<ImportContentResult>;
      })
    );
  }
}
