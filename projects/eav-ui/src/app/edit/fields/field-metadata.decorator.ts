import { Type } from '@angular/core';
import 'reflect-metadata';

export const FieldMetadataKey = 'FieldMetadata' as const;

/**
 * Angular decorator to add metadata to a field component.
 * @param metadata 
 * @returns 
 */
export function FieldMetadata(metadata: FieldMetadataModel) {
  return (component: Type<any>) => {
    Reflect.defineMetadata(FieldMetadataKey, metadata, component);
  };
}

export interface FieldMetadataModel {
  wrappers?: string[];
  requiredFeatures?: string[];
}
