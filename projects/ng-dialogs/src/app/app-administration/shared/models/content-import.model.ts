export class ContentImport {
  appId: number;
  defaultLanguage: string;
  contentType: string;
  file: File;
  resourcesReferences: string;
  clearEntities: string;
}

export class ImportContentRequest {
  AppId: string;
  DefaultLanguage: string;
  ContentType: string;
  ContentBase64: string;
  ResourcesReferences: string;
  ClearEntities: string;
}

export class EvaluateContentResult {
  Succeeded: boolean;
  Detail: EvaluateContentResultDetail;
}

export class EvaluateContentResultDetail {
  AmountOfEntitiesCreated: number;
  AmountOfEntitiesDeleted: number;
  AmountOfEntitiesUpdated: number;
  AttributeNamesInDocument: string[];
  AttributeNamesInContentType: string[];
  AttributeNamesNotImported: string[];
  DocumentElementsCount: number;
  LanguagesInDocumentCount: number;
}

export class ImportContentResult {
  Succeeded: boolean;
  Detail: any; // spm Figure out the type
}
