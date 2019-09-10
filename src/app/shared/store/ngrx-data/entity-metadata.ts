import { EntityMetadataMap } from '@ngrx/data';

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
  InputType: {
    selectId: InputTypeSelectId,
  },
};

export const pluralNames = {
  Feature: 'Features', // example
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};

export function itemSelectId<T extends { entity: any }>(entity: T) {
  return entity === null ? undefined : entity.entity.id;
}

export function languageSelectId<T extends { key: any }>(entity: T) {
  return entity === null ? undefined : entity.key;
}

export function languageInstanceSelectId<T extends { formId: any }>(entity: T) {
  return entity === null ? undefined : entity.formId;
}

export function contentTypeSelectId<T extends { contentType: any }>(entity: T) {
  return entity === null ? undefined : entity.contentType.id;
}

export function InputTypeSelectId<T extends { Type: any }>(entity: T) {
  return entity === null ? undefined : entity.Type;
}
