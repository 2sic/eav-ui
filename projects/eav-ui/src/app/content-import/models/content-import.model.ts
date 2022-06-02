export interface ContentImport {
  defaultLanguage: string;
  contentType: string;
  file: File;
  resourcesReferences: string;
  clearEntities: string;
}

export interface ImportContentRequest {
  AppId: string;
  DefaultLanguage: string;
  ContentType: string;
  ContentBase64: string;
  ResourcesReferences: string;
  ClearEntities: string;
}

export interface EvaluateContentResult {
  Success: boolean;
  /** Success === true */
  Detail?: EvaluateContentResultDetail;
  /** Success === false */
  Errors?: EvaluateContentResultError[];
}

export interface EvaluateContentResultDetail {
  AmountOfEntitiesCreated: number;
  AmountOfEntitiesDeleted: number;
  AmountOfEntitiesUpdated: number;
  AttributeNamesInDocument: string[];
  AttributeNamesInContentType: string[];
  AttributeNamesNotImported: string[];
  DocumentElementsCount: number;
  LanguagesInDocumentCount: number;
}

export interface EvaluateContentResultError {
  Message: string;
  ErrorCode: number;
  ErrorDetail: string;
  LineNumber: number;
  LineDetail: string;
}

export interface ImportContentResult {
  Success: boolean;
  Detail: any;
}
