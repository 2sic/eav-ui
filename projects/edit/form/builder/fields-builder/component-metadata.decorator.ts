import { Type } from '@angular/core';
import 'reflect-metadata';
import { componentMetadataKey } from '../../../shared/constants';
import { ComponentMetadataModel } from '../../../shared/models';

export function ComponentMetadata(metadata: ComponentMetadataModel) {
  return (component: Type<any>) => {
    Reflect.defineMetadata(componentMetadataKey, metadata, component);
  };
}
