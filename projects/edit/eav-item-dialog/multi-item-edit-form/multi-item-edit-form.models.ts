import { DialogContextApp, DialogContextLanguage, DialogContextSite, DialogContextSystem } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';
import { InputType } from '../../shared/models/eav';
import { EntityInfo } from '../../shared/models/eav/entity-info';
import { Entity1, JsonContentType1, JsonItem1 } from '../../shared/models/json-format-v1';

export interface EavFormData {
  ContentTypeItems: Entity1[];
  ContentTypes: JsonContentType1[];
  Context: EditDialogContext;
  DraftShouldBranch: boolean;
  Features: any[];
  InputTypes: InputType[];
  IsPublished: boolean;
  Items: JsonItem1[];
  Prefetch: Prefetch;
}

export interface EditDialogContext {
  App: DialogContextApp;
  Language: DialogContextLanguage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}

export interface Prefetch {
  Entities: EntityInfo[];
  Links: PrefetchLinks;
  _guid?: string;
}

export interface PrefetchLinks {
  [key: string]: string;
}
