import { DialogContextApp, DialogContextLanguage, DialogContextSite, DialogContextSystem } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';
import { InputType, Item } from '../../shared/models/eav';
import { EntityInfo } from '../../shared/models/eav/entity-info';
import { Entity1, JsonContentType1, JsonItem1 } from '../../shared/models/json-format-v1';

export interface EavPublishStatus {
  DraftShouldBranch: boolean;
  IsPublished: boolean;
}

export interface EavFormData extends EavPublishStatus {
  ContentTypeItems: Entity1[];
  ContentTypes: JsonContentType1[];
  Context: EditDialogContext;
  Features: any[];
  InputTypes: InputType[];
  Items: JsonItem1[];
  Prefetch: Prefetch;
}

export interface EditDialogContext {
  App: DialogContextApp;
  Language: DialogContextLanguage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}

export interface SaveEavFormData extends EavPublishStatus {
  Items: JsonItem1[];
}

export interface MultiEditFormTemplateVars {
  items: Item[];
  formsAreValid: boolean;
  allControlsAreDisabled: boolean;
  reduceSaveButton: boolean;
  debugEnabled: boolean;
  debugInfoIsOpen: boolean;
  hideHeader: boolean;
}

export interface Prefetch {
  Entities: EntityInfo[];
  Links: PrefetchLinks;
  _guid?: string;
}

export interface PrefetchLinks {
  [key: string]: string;
}
