import { Type } from '@angular/core';
import 'reflect-metadata';
import { fieldMetadataKey } from '../../../shared/constants';
import { FieldMetadataModel } from '../../../shared/models';

export function FieldMetadata(metadata: FieldMetadataModel) {
  return (component: Type<any>) => {
    Reflect.defineMetadata(fieldMetadataKey, metadata, component);
  };
}
