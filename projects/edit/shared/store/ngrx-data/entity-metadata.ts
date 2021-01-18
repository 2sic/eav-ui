import { EntityMetadataMap } from '@ngrx/data';
import { ContentType, EavEntity, InputType, Item, Language } from '../../models/eav';
import { LanguageInstance } from '../../models/eav/language-instance';
import { PublishStatus } from '../../models/eav/publish-status';

export const entityMetadata: EntityMetadataMap = {
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
    selectId: InputTypeSelectId,
  },
  PublishStatus: {
    selectId: PublishStatusSelectId,
  },
  Prefetch: {
    selectId: prefetchSelectId,
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

export function itemSelectId(item: Item): string {
  return item == null ? undefined : item.entity.guid;
}

export function languageSelectId(language: Language): string {
  return language == null ? undefined : language.key;
}

export function languageInstanceSelectId(languageInstance: LanguageInstance): number {
  return languageInstance == null ? undefined : languageInstance.formId;
}

export function contentTypeSelectId(contentType: ContentType): string {
  return contentType == null ? undefined : contentType.Id;
}

export function contentTypeItemSelectId(contentTypeItem: EavEntity): string {
  return contentTypeItem == null ? undefined : contentTypeItem.guid;
}

export function InputTypeSelectId(inputType: InputType): string {
  return inputType == null ? undefined : inputType.Type;
}

export function PublishStatusSelectId(publishStatus: PublishStatus): number {
  return publishStatus == null ? undefined : publishStatus.formId;
}

export function prefetchSelectId<T extends { _guid: any }>(entity: T) {
  return entity === null ? undefined : entity._guid;
}
