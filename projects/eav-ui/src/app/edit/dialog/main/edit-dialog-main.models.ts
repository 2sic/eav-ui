import { Of } from '../../../../../../core';
import { AdamItem } from '../../../../../../edit-types/src/AdamItem';
import { DialogContext } from '../../../app-administration/models';
import { FeatureNames } from '../../../features/feature-names';
import { InputTypeMetadata } from '../../../shared/fields/input-type-metadata.model';
import { EavContentType, EavEntity } from '../../shared/models/eav';
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
} as const /* the as const ensures that the keys/values can be strictly checked */;


export type RequiredFeatures = Record<Of<typeof FeatureNames>, string[]>;

export interface EavEditLoadDto extends EavPublishStatus {
  ContentTypeItems: EavEntityDto[];
  ContentTypes: EavContentTypeDto[];
  Context: DialogContext;
  InputTypes: InputTypeMetadata[];
  Items: EavEntityBundleDto[];
  Prefetch?: Prefetch;
  Settings: EditSettingsDto;
  RequiredFeatures?: RequiredFeatures;
}

export interface EditSettings {
  Values: Record<string, unknown>;
  /** SettingsEntities are important for more advanced settings such as WYSIWYG */
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
