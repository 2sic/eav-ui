import { FieldSettings, FieldValue } from '../../../../../../../edit-types';
import { FieldLogicManager } from './field-logic-manager';
import { FieldLogicTools } from './field-logic-tools';

type LogicConstructor = new (...args: any[]) => FieldLogicBase;

export abstract class FieldLogicBase {
  /** Input type name */
  abstract name: string;

  public canAutoTranslate = false;

  /** Adds Logic to FieldLogicManager */
  static add(logic: LogicConstructor) {
    const logicInstance = new logic();
    FieldLogicManager.singleton().add(logicInstance);
  }

  /** Run this dummy method from Field code to make sure Logic files are not tree shaken */
  static importMe(): void {
  }

  /** Update field settings */
  abstract update(settings: FieldSettings, value: FieldValue, tools: FieldLogicTools): FieldSettings;
}
