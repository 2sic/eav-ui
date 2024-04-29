import { AdamItem, PickerItem } from '../../../../../../edit-types';
import { DialogContext } from '../../../app-administration/models';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { Feature } from '../../../features/models/feature.model';
import { LinkInfo } from '../../shared/models';
import { EavContentType, EavEntity, EavItem } from '../../shared/models/eav';
import { EavContentTypeDto, EavEntityBundleDto, EavEntityDto } from '../../shared/models/json-format-v1';

export interface EavPublishStatus {
  DraftShouldBranch: boolean;
  IsPublished: boolean;
}

export interface EavEditLoadDto extends EavPublishStatus {
  ContentTypeItems: EavEntityDto[];
  ContentTypes: EavContentTypeDto[];
  Context: DialogContext;
  Features: Feature[];
  InputTypes: InputType[];
  Items: EavEntityBundleDto[];
  Prefetch?: Prefetch;
  Settings: EditSettingsDto;
}

export interface EditSettings {
  Values: Record<string, unknown>;
  // note: added by 2dm 2023-01-21 but not used yet
  // will probably contain special wysiwyg-edit configs and similar...
  Entities: EavEntity[];
  /**
   * ContentTypes which are additional settings.
   * New v17 to help Pickers figure out the best title for new-entities.
   * TODO: @SDV
   */
  ContentTypes: EavContentType[];
}

export interface EditSettingsDto {
  Values: Record<string, unknown>;
  Entities: EavEntityDto[];
  /**
   * ContentTypes which are additional settings.
   * New v17 to help Pickers figure out the best title for new-entities.
   * TODO: @SDV
   */
  ContentTypes: EavContentTypeDto[];
}

export interface SaveEavFormData extends EavPublishStatus {
  Items: EavEntityBundleDto[];
}

export interface EditDialogMainViewModel {
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
  Entities: PrefetchEntity[];
  Links: PrefetchLinks;

  /** NgRx store helper */
  _guid?: string;
}

/**
 * temporary interface till backend is updated again to match latest requirements.
 * Should then be replaced with EntityBasic
 */
export interface PrefetchEntity {
  Id: number,
  Value: string,
  Text: string,
}

/** Temporary till the models are somehow in sync again */
export function prefetchItemToPickerItem(item: PrefetchEntity): PickerItem {
  return {
    Id: item.Id,
    label: item.Text,
    value: item.Value,
  };
}

export interface PrefetchAdams {
  [entityGuid: string]: {
    [fieldName: string]: AdamItem[];
  };
}

export interface PrefetchLinks {
  [key: string]: LinkInfo;
}
