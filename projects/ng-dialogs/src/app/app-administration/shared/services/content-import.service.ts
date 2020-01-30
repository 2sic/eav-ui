import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentImport, ImportContentRequest, EvaluateContentResult, ImportContentResult } from '../models/content-import.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentImportService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  async evaluateContent(formValues: ContentImport) {
    const requestData: ImportContentRequest = {
      AppId: this.context.appId.toString(),
      DefaultLanguage: formValues.defaultLanguage,
      ContentType: formValues.contentType,
      ContentBase64: await this.toBase64(formValues.file),
      ResourcesReferences: formValues.resourcesReferences,
      ClearEntities: formValues.clearEntities,
    };
    return <Observable<EvaluateContentResult>>(
      this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ContentImport/EvaluateContent'), requestData)
    );
  }

  async importContent(formValues: ContentImport) {
    const requestData: ImportContentRequest = {
      AppId: this.context.appId.toString(),
      DefaultLanguage: formValues.defaultLanguage,
      ContentType: formValues.contentType,
      ContentBase64: await this.toBase64(formValues.file),
      ResourcesReferences: formValues.resourcesReferences,
      ClearEntities: formValues.clearEntities,
    };
    return <Observable<ImportContentResult>>(
      this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ContentImport/ImportContent'), requestData)
    );
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((<string>reader.result).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
}
