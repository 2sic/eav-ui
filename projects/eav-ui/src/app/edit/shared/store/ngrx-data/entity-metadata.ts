import { EntityMetadataMap } from '@ngrx/data';
import { Feature } from 'projects/eav-ui/src/app/features/models/feature.model';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { Prefetch } from '../../../dialog/main/edit-dialog-main.models';
import { AdamSnapshot, Language, LanguageInstance, LinkCache, PublishStatus, PickerStringQueryCacheItem } from '../../models';
import { EavContentType, EavEntity, EavItem } from '../../models/eav';
import { IdentityUpperCaseId } from '../../models/identity-upper-case-id';

export const entityMetadata: EntityMetadataMap = {
  GlobalConfig: {},
  Item: {
    selectId: itemSelectId,
  },
  Feature: {
    selectId: featureSelectId,
  },
  Language: {
    selectId: languageSelectId,
  },
  LanguageInstance: {
    selectId: languageInstanceSelectId,
  },
  ContentType: {
    selectId: contentTypeSelectId,
  },
  ContentTypeItem: {
    selectId: contentTypeItemSelectId,
  },
  InputType: {
    selectId: inputTypeSelectId,
  },
  PublishStatus: {
    selectId: publishStatusSelectId,
  },
  Prefetch: {
    selectId: prefetchSelectId,
  },
  // Entity Cache is actually the PickerItem Cache, uses UpperCase Id
  EntityCache: {
    selectId: useUpperCaseId,
  },
  AdamCache: {
    selectId: adamCacheSelectId,
  },
  LinkCache: {
    selectId: linkCacheSelectId,
  },
  StringQueryCache: {
    selectId: stringQueryCacheSelectId,
  },
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
  return feature?.Guid;
}

function languageSelectId(language: Language): string {
  return language?.NameId;
}

function languageInstanceSelectId(languageInstance: LanguageInstance): number {
  return languageInstance?.formId;
}

function contentTypeSelectId(contentType: EavContentType): string {
  return contentType?.Id;
}

function contentTypeItemSelectId(contentTypeItem: EavEntity): string {
  return contentTypeItem?.Guid;
}

function inputTypeSelectId(inputType: InputType): string {
  return inputType?.Type;
}

function publishStatusSelectId(publishStatus: PublishStatus): number {
  return publishStatus?.formId;
}

function prefetchSelectId(entity: Prefetch): string {
  return entity?._guid;
}

// Select anything that's identified by an upper-case ID
function useUpperCaseId(entity: IdentityUpperCaseId /* PickerItem */): number {
  return entity?.Id;
}

function adamCacheSelectId(adamSnapshot: AdamSnapshot): string {
  return adamSnapshot?.Guid;
}

function linkCacheSelectId(link: LinkCache): string {
  return link?.key;
}

function stringQueryCacheSelectId(cacheItem: PickerStringQueryCacheItem): string {
  return cacheItem?.selector;
}
