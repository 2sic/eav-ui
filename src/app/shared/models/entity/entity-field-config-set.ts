import { EntityInfo } from '../eav/entity-info';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';

export interface EntityFieldConfigSet extends FieldConfigSet {
  cache: EntityInfo[];
}
