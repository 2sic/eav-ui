import { Type } from '@angular/core';
import 'reflect-metadata';
import { FieldMetadataKey } from '../../../shared/constants';
import { FieldMetadataModel } from '../../../shared/models';

export function FieldMetadata(metadata: FieldMetadataModel) {
  return (component: Type<any>) => {
    Reflect.defineMetadata(FieldMetadataKey, metadata, component);
  };
}
