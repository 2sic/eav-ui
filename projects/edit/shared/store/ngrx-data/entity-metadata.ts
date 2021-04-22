import { EntityMetadataMap } from '@ngrx/data';
import { InputType } from '../../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { Prefetch } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { QueryEntity } from '../../../eav-material-controls/input-types/entity/entity-query/entity-query.models';
import { AdamSnapshot, EntityInfo, Language, LanguageInstance, LinkCache, PublishStatus } from '../../models';
import { EavContentType, EavEntity, EavItem } from '../../models/eav';

export const entityMetadata: EntityMetadataMap = {
  GlobalConfig: {},
  Item: {
    selectId: itemSelectId,
  },
  Feature: {},
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
  EntityCache: {
    selectId: entityCacheSelectId,
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

export const pluralNames = {
  Feature: 'Features', // example
  PublishStatus: 'PublishStatuses',
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};

export function itemSelectId(item: EavItem): string {
  return item?.Entity?.Guid;
}

export function languageSelectId(language: Language): string {
  return language?.key;
}

export function languageInstanceSelectId(languageInstance: LanguageInstance): number {
  return languageInstance?.formId;
}

export function contentTypeSelectId(contentType: EavContentType): string {
  return contentType?.Id;
}

export function contentTypeItemSelectId(contentTypeItem: EavEntity): string {
  return contentTypeItem?.Guid;
}

export function inputTypeSelectId(inputType: InputType): string {
  return inputType?.Type;
}

export function publishStatusSelectId(publishStatus: PublishStatus): number {
  return publishStatus?.formId;
}

export function prefetchSelectId(entity: Prefetch): string {
  return entity?._guid;
}

export function entityCacheSelectId(entity: EntityInfo): number {
  return entity?.Id;
}

export function adamCacheSelectId(adamSnapshot: AdamSnapshot): string {
  return adamSnapshot?.Guid;
}

export function linkCacheSelectId(link: LinkCache): string {
  return link?.key;
}

export function stringQueryCacheSelectId(entity: QueryEntity): string {
  return entity?.Guid;
}
