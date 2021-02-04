import { FieldSettings } from '../../edit-types';
import { FieldValue } from '../shared/models/field-value.model';
import { FieldLogicManager } from './field-logic-manager';

type LogicConstructor = new (...args: any[]) => FieldLogicBase;

export abstract class FieldLogicBase {
  /** Input type name */
  public abstract name: string;

  /** Adds Logic to FieldLogicManager */
  public static add(logic: LogicConstructor) {
    const logicInstance = new logic();
    FieldLogicManager.singleton().add(logicInstance);
  }

  /** Run this dummy method from Field code to make sure Logic files are not tree shaken */
  public static importMe(): void {
  }

  /** Update field settings */
  public abstract update(settings: FieldSettings, value: FieldValue): FieldSettings;
}
