import { EntityMetadataMap } from '@ngrx/data';

export const entityMetadata: EntityMetadataMap = {
  Feature: {},
  Language: {
    selectId: languageSelectId,
  },
  ContentType: {
    selectId: contentTypeSelectId,
  },
  InputType: {
    selectId: InputTypeSelectId,
  },
};

export const pluralNames = {
  Feature: 'Features',
  Language: 'Languages',
  ContentType: 'ContentTypes',
  InputType: 'InputTypes',
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};

export function languageSelectId<T extends { key: any }>(entity: T) {
  return entity === null ? undefined : entity.key;
}

export function contentTypeSelectId<T extends { contentType: any }>(entity: T) {
  return entity === null ? undefined : entity.contentType.id;
}

export function InputTypeSelectId<T extends { Type: any }>(entity: T) {
  return entity === null ? undefined : entity.Type;
}
