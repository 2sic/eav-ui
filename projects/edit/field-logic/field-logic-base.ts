import { FieldSettings } from '../../edit-types';

export abstract class FieldLogicBase {
  abstract name: string;
  abstract init(settings: FieldSettings): FieldSettings;

  constructor() { }
}
