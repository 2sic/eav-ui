import { JsonItem1, JsonContentType1 } from '../../shared/models/json-format-v1';
import { InputType } from '../../shared/models/eav';
import { DialogContextApp, DialogContextLanguage, DialogContextSite, DialogContextSystem } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';

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
  App: DialogContextApp;
  Language: DialogContextLanguage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}
