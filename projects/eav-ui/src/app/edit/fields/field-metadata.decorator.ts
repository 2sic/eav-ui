import { Type } from '@angular/core';
import 'reflect-metadata';

export const FieldMetadataKey = 'FieldMetadata' as const;

export function FieldMetadata(metadata: FieldMetadataModel) {
  return (component: Type<any>) => {
    Reflect.defineMetadata(FieldMetadataKey, metadata, component);
  };
}

export interface FieldMetadataModel {
  wrappers?: string[];
}
