import { EntityMetadataMap } from '@ngrx/data';

export const entityMetadata: EntityMetadataMap = {
  Feature: {},
  Language: {
    selectId: languageSelectId,
  },
};

export const pluralNames = {
  Feature: 'Features',
  Language: 'Languages',
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};

export function languageSelectId<T extends { key: any }>(entity: T) {
  return entity === null ? undefined : entity.key;
}
