import { EntityMetadataMap } from '@ngrx/data';
import { Prefetch } from '../../../dialog/main/edit-dialog-main.models';
import { EavItem } from '../../models/eav';
import { Feature } from '../../../../features/models/feature.model';
import { FormLanguageInStore } from './language-instance.service';

export const entityMetadata: EntityMetadataMap = {
  GlobalConfig: {},
  Item: {
    selectId: itemSelectId,
  },
  Feature: {
    selectId: featureSelectId,
  },
  // TODO:: remove after testing ist done
  // Language: {
  //   selectId: languageSelectId,
  // },

  // FormLanguageInStore: {
  //   selectId: languageInstanceSelectId,
  // },

  // TODO:: Old Code, remove after testing ist done
  // ContentType: {
  //   selectId: contentTypeSelectId,
  // },
  // TODO:: Old Code, remove after testing ist done
  // ContentTypeItem: {
  //   selectId: contentTypeItemSelectId,
  // },
  // TODO:: Old Code, remove after testing ist done
  // InputType: {
  //   selectId: inputTypeSelectId,
  // },
  // TODO:: Old Code, remove after testing ist done
  // PublishStatus: {
  //   selectId: publishStatusSelectId,
  // },
  Prefetch: {
    selectId: prefetchSelectId,
  },
  // Entity Cache is actually the PickerItem Cache, uses UpperCase Id
  EntityCache: {
    selectId: useLowerCaseId,
  },
  // TODO:: Old Code, remove after testing ist done
  // AdamCache: {
  //   selectId: adamCacheSelectId,
  // },

  // TODO:: Old Code, remove after testing ist done
  // LinkCache: {
  //   selectId: linkCacheSelectId,
  // },
};

const pluralNames = {
  Feature: 'Features', // example
  PublishStatus: 'PublishStatuses',
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};

function itemSelectId(item: EavItem): string {
  return item?.Entity?.Guid;
}

function featureSelectId(feature: Feature): string {
  return feature?.guid;
}

// TODO:: remove after testing ist done
// function languageSelectId(language: Language): string {
//   return language?.NameId;
// }

function languageInstanceSelectId(languageInstance: FormLanguageInStore): number {
  return languageInstance?.formId;
}

// TODO:: Old Code, remove after testing ist done
// function contentTypeSelectId(contentType: EavContentType): string {
//   return contentType?.Id;
// }

// TODO:: Old Code, remove after testing ist done
// function contentTypeItemSelectId(contentTypeItem: EavEntity): string {
//   return contentTypeItem?.Guid;
// }

// TODO:: Old Code, remove after testing ist done
// function inputTypeSelectId(inputType: InputType): string {
//   return inputType?.Type;
// }

// TODO:: Old Code, remove after testing ist done
// function publishStatusSelectId(publishStatus: PublishStatus): number {
//   return publishStatus?.formId;
// }

function prefetchSelectId(entity: Prefetch): string {
  return entity?._guid;
}

function useLowerCaseId(entity: { id: number } /* PickerItem */): number {
  return entity?.id;
}

// function adamCacheSelectId(adamSnapshot: AdamSnapshot): string {  // TODO:: Old Code, remove after testing ist done
//   return adamSnapshot?.Guid;
// }

// function linkCacheSelectId(link: LinkCache): string { // TODO:: Old Code, remove after testing ist done
//   return link?.key;
// }
