import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContentImport, ImportContentRequest } from '../models/content-import.model';

@Injectable()
export class ContentImportService {
  constructor(
    private http: HttpClient,
  ) { }

  async evaluateContent(formValues: ContentImport) {
    const requestData: ImportContentRequest = {
      AppId: formValues.appId.toString(), DefaultLanguage: formValues.defaultLanguage,
      ContentType: formValues.contentType, ContentBase64: await this.toBase64(formValues.file),
      ResourcesReferences: formValues.resourcesReferences, ClearEntities: formValues.clearEntities,
    };
    return this.http.post('/desktopmodules/2sxc/api/eav/ContentImport/EvaluateContent', requestData);
  }

  async importContent(formValues: ContentImport) {
    const requestData: ImportContentRequest = {
      AppId: formValues.appId.toString(), DefaultLanguage: formValues.defaultLanguage,
      ContentType: formValues.contentType, ContentBase64: await this.toBase64(formValues.file),
      ResourcesReferences: formValues.resourcesReferences, ClearEntities: formValues.clearEntities,
    };
    return this.http.post('/desktopmodules/2sxc/api/eav/ContentImport/ImportContent', requestData);
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

}
