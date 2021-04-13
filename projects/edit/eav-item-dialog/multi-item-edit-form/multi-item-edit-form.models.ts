import { AdamItem } from '../../../edit-types';
import { Feature } from '../../../ng-dialogs/src/app/apps-management/models/feature.model';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { DialogContextApp, DialogContextLanguage, DialogContextSite, DialogContextSystem } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';
import { EntityInfo, LinkInfo } from '../../shared/models';
import { EavItem } from '../../shared/models/eav';
import { ContentType1, Entity1, Item1 } from '../../shared/models/json-format-v1';

export interface EavPublishStatus {
  DraftShouldBranch: boolean;
  IsPublished: boolean;
}

export interface EavFormData extends EavPublishStatus {
  ContentTypeItems: Entity1[];
  ContentTypes: ContentType1[];
  Context: EditDialogContext;
  Features: Feature[];
  InputTypes: InputType[];
  Items: Item1[];
  Prefetch?: Prefetch;
}

export interface EditDialogContext {
  App: DialogContextApp;
  Language: DialogContextLanguage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}

export interface SaveEavFormData extends EavPublishStatus {
  Items: Item1[];
}

export interface MultiEditFormTemplateVars {
  items: EavItem[];
  formsValid: boolean;
  delayForm: boolean;
  reduceSaveButton: boolean;
  debugEnabled: boolean;
  debugInfoIsOpen: boolean;
  hideHeader: boolean;
}

export interface Prefetch {
  Adam: PrefetchAdams;
  Entities: EntityInfo[];
  Links: PrefetchLinks;

  /** NgRx store helper */
  _guid?: string;
}

export interface PrefetchAdams {
  [entityGuid: string]: {
    [fieldName: string]: AdamItem[];
  };
}

export interface PrefetchLinks {
  [key: string]: LinkInfo;
}
