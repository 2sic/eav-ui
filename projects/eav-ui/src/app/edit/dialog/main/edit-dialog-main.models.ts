import { AdamItem, EntityInfo } from '../../../../../../edit-types';
import { DialogContext } from '../../../app-administration/models';
import { Feature } from '../../../apps-management/models/feature.model';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { LinkInfo } from '../../shared/models';
import { EavItem } from '../../shared/models/eav';
import { ContentType1, Entity1, Item1 } from '../../shared/models/json-format-v1';

export interface EavPublishStatus {
  DraftShouldBranch: boolean;
  IsPublished: boolean;
}

export interface EavFormData extends EavPublishStatus {
  ContentTypeItems: Entity1[];
  ContentTypes: ContentType1[];
  Context: DialogContext;
  Features: Feature[];
  InputTypes: InputType[];
  Items: Item1[];
  Prefetch?: Prefetch;
}

export interface SaveEavFormData extends EavPublishStatus {
  Items: Item1[];
}

export interface EditDialogMainTemplateVars {
  items: EavItem[];
  formsValid: boolean;
  delayForm: boolean;
  viewInitiated: boolean;
  debugEnabled: boolean;
  debugInfoIsOpen: boolean;
  hideHeader: boolean;
  saveButtonDisabled: boolean;
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
