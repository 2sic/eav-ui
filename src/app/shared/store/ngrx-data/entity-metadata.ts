import { EntityMetadataMap } from '@ngrx/data';

export const entityMetadata: EntityMetadataMap = {
  Feature: {},
  Language: {
    selectId: languageSelectId,
  },
  InputType: {
    selectId: InputTypeSelectId,
  },
};

export const pluralNames = {
  Feature: 'Features',
  Language: 'Languages',
  InputType: 'InputTypes',
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};

export function languageSelectId<T extends { key: any }>(entity: T) {
  return entity === null ? undefined : entity.key;
}

export function InputTypeSelectId<T extends { Type: any }>(entity: T) {
  return entity === null ? undefined : entity.Type;
}
