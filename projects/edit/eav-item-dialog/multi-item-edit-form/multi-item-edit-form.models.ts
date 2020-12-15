import { DialogContextApp, DialogContextLanguage, DialogContextSite, DialogContextSystem } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';
import { InputType } from '../../shared/models/eav';
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
}

export interface EditDialogContext {
  App: DialogContextApp;
  Language: DialogContextLanguage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}
