import { AdamItem } from '../../../../../../edit-types';
import { DialogContext } from '../../../app-administration/models';
import { InputTypeMetadata } from '../../../shared/fields/input-type-metadata.model';
import { EavContentType, EavEntity, EavItem } from '../../shared/models/eav';
import { EavContentTypeDto, EavEntityBundleDto, EavEntityDto } from '../../shared/models/json-format-v1';


export interface EavPublishStatus {
  DraftShouldBranch: boolean;
  IsPublished: boolean;
}

export interface PublishStatus extends EavPublishStatus {
  formId: number;
}

/** PublishMode is short version of PublishStatus */
export const PublishModes = {
  Show: 'show',
  Hide: 'hide',
  Branch: 'branch',
} as const;

export type PublishMode = typeof PublishModes[keyof typeof PublishModes];


export interface EavEditLoadDto extends EavPublishStatus {
  ContentTypeItems: EavEntityDto[];
  ContentTypes: EavContentTypeDto[];
  Context: DialogContext;
  InputTypes: InputTypeMetadata[];
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
  viewInitiated: boolean;
}

export interface Prefetch {
  Adam: PrefetchAdams;

  // #RemovePickerDataCacheService
  // /**
  //  * Entities for dropdowns which were already selected
  //  * TODO: AS OF 2024-08-27 it is not in use any more, so we should either
  //  * - remove from the backend
  //  * - rethink what we do/improve
  //  */
  // Entities: PrefetchEntity[];
  Links: PrefetchLinks;

  /** NgRx store helper */
  _guid?: string;
}

// #RemovePickerDataCacheService
// /**
//  * temporary interface till backend is updated again to match latest requirements.
//  * Should then be replaced with EntityBasic
//  */
// export interface PrefetchEntity {
//   Id: number,
//   Value: string,
//   Text: string,
// }
// /** Temporary till the models are somehow in sync again */
// export function prefetchItemToPickerItem(item: PrefetchEntity): PickerItem {
//   return {
//     id: item.Id,
//     label: item.Text,
//     value: item.Value,
//   };
// }

export interface PrefetchAdams {
  [entityGuid: string]: {
    [fieldName: string]: AdamItem[];
  };
}

export interface PrefetchLinks {
  [key: string]: LinkInfo;
}

export interface LinkInfo {
  /** Null if URL doesn't resolve to ADAM file (is page, external url or blocked by permissions) */
  Adam?: AdamItem;
  /** Resolved or original URL */
  Value: string;
}