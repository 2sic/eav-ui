import { EntityMetadataMap } from '@ngrx/data';
import { Prefetch } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
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
    selectId: inputTypeSelectId,
  },
  PublishStatus: {
    selectId: publishStatusSelectId,
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
  return item?.entity?.guid;
}

export function languageSelectId(language: Language): string {
  return language?.key;
}

export function languageInstanceSelectId(languageInstance: LanguageInstance): number {
  return languageInstance?.formId;
}

export function contentTypeSelectId(contentType: ContentType): string {
  return contentType?.Id;
}

export function contentTypeItemSelectId(contentTypeItem: EavEntity): string {
  return contentTypeItem?.guid;
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
