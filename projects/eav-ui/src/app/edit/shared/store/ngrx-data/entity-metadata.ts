import { EntityMetadataMap } from '@ngrx/data';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { Prefetch } from '../../../dialog/main/edit-dialog-main.models';
import { AdamSnapshot, Language, FormLanguageInStore, LinkCache, PublishStatus } from '../../models';
import { EavContentType, EavEntity, EavItem } from '../../models/eav';
import { Feature } from '../../../../features/models/feature.model';

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
  FormLanguageInStore: {
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
    selectId: useLowerCaseId,
  },
  AdamCache: {
    selectId: adamCacheSelectId,
  },
  LinkCache: {
    selectId: linkCacheSelectId,
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
  return feature?.guid;
}

function languageSelectId(language: Language): string {
  return language?.NameId;
}

function languageInstanceSelectId(languageInstance: FormLanguageInStore): number {
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

function useLowerCaseId(entity: { id: number } /* PickerItem */): number {
  return entity?.id;
}

function adamCacheSelectId(adamSnapshot: AdamSnapshot): string {
  return adamSnapshot?.Guid;
}

function linkCacheSelectId(link: LinkCache): string {
  return link?.key;
}
