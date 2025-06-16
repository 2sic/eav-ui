import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentImport, EvaluateContentResult, ImportContentRequest, ImportContentResult } from '../models/content-import.model';

@Injectable()
export class ContentImportService extends HttpServiceBaseSignal {

  evaluateContent(formValues: ContentImport) {
    return from(toBase64(formValues.file)).pipe(
      switchMap(fileBase64 => {
        const requestData: ImportContentRequest = {
          AppId: this.appId,
          DefaultLanguage: formValues.defaultLanguage,
          ContentType: formValues.contentType,
          ContentBase64: fileBase64,
          ResourcesReferences: formValues.resourcesReferences,
          ClearEntities: formValues.clearEntities,
        };
        return this.http.post<EvaluateContentResult>(this.apiUrl(webApiEntityRoot + 'XmlPreview'), requestData).pipe(
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
          AppId: this.appId,
          DefaultLanguage: formValues.defaultLanguage,
          ContentType: formValues.contentType,
          ContentBase64: fileBase64,
          ResourcesReferences: formValues.resourcesReferences,
          ClearEntities: formValues.clearEntities,
        };
        return this.http.post<ImportContentResult>(this.apiUrl(webApiEntityRoot + 'XmlUpload'), requestData);
      })
    );
  }
}
