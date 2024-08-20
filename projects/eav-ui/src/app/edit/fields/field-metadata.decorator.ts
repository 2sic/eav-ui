import { Type } from '@angular/core';
import 'reflect-metadata';
import { FieldMetadataModel } from '../shared/models';

export const FieldMetadataKey = 'FieldMetadata' as const;

export function FieldMetadata(metadata: FieldMetadataModel) {
  return (component: Type<any>) => {
    Reflect.defineMetadata(FieldMetadataKey, metadata, component);
  };
}
