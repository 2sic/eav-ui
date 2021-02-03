import { FieldSettings } from '../../edit-types';
import { FieldValue } from '../shared/models/field-value.model';

export abstract class FieldLogicBase {
  abstract name: string;
  abstract update(settings: FieldSettings, value: FieldValue): FieldSettings;

  constructor() { }
}
