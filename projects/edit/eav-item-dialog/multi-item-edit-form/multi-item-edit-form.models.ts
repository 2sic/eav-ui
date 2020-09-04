import { JsonItem1, JsonContentType1 } from '../../shared/models/json-format-v1';
import { InputType } from '../../shared/models/eav';

export interface EavFormData {
  ContentTypeItems: any[];
  ContentTypes: JsonContentType1[];
  Context: EditDialogContext;
  DraftShouldBranch: boolean;
  Features: any[];
  InputTypes: InputType[];
  IsPublished: boolean;
  Items: JsonItem1[];
}

export interface EditDialogContext {
  App: EditDialogApp;
  Language: EditDialogLanguage;
  Site: EditDialogSite;
  System: EditDialogSystem;
}

export interface EditDialogApp {
  GettingStartedUrl: string;
  Id: number;
  Identifier: unknown;
  Name: string;
  Url: string;
}

export interface EditDialogLanguage {
  All: EditDialogAllLangs;
  Current: string;
  Primary: string;
}

export interface EditDialogAllLangs {
  [key: string]: string;
}

export interface EditDialogSite {
  Id: number;
  Url: string;
}

export interface EditDialogSystem {
  Url: string;
}
