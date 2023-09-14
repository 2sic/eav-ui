import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { webApiEntityRoot } from '../../edit/shared/services';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Context } from '../../shared/services/context';
import { ContentImport, EvaluateContentResult, ImportContentRequest, ImportContentResult } from '../models/content-import.model';

@Injectable()
export class ContentImportService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  evaluateContent(formValues: ContentImport) {
    return from(toBase64(formValues.file)).pipe(
      switchMap(fileBase64 => {
        const requestData: ImportContentRequest = {
          AppId: this.context.appId.toString(),
          DefaultLanguage: formValues.defaultLanguage,
          ContentType: formValues.contentType,
          ContentBase64: fileBase64,
          ResourcesReferences: formValues.resourcesReferences,
          ClearEntities: formValues.clearEntities,
        };
        return this.http.post<EvaluateContentResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'XmlPreview'), requestData).pipe(
          map(result => {
            if (!result.Success) {
              result.Errors = result.Detail as any;
              delete result.Detail;
            }
            return result;
          }),
        );
      })
    );
  }

  importContent(formValues: ContentImport) {
    return from(toBase64(formValues.file)).pipe(
      switchMap(fileBase64 => {
        const requestData: ImportContentRequest = {
          AppId: this.context.appId.toString(),
          DefaultLanguage: formValues.defaultLanguage,
          ContentType: formValues.contentType,
          ContentBase64: fileBase64,
          ResourcesReferences: formValues.resourcesReferences,
          ClearEntities: formValues.clearEntities,
        };
        return this.http.post<ImportContentResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'XmlUpload'), requestData);
      })
    );
  }
}
