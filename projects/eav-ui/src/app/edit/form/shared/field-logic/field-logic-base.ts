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

  /**
   * Lookup advanced (external) configuration.
   * These are usually stored in the eavConfig.settings.
   * Needs defaults to merge for anything that is not defined in the external config.
   * @param possibleGuid - guid of the external config, if empty, return defaults
   * @param defaults - defaults to merge with external config
   */
  findAndMergeAdvanced<T>(tools: FieldLogicTools, possibleGuid: string, defaults: T): T {
    if (!possibleGuid) return defaults;

    const wysiwygConfig = tools.eavConfig.settings.Entities.find(e => e.Guid === possibleGuid);
    if (!wysiwygConfig) return defaults;

    const advanced = tools.entityReader.flatten(wysiwygConfig) as T;
    return { ...defaults, ...advanced };
  }
}
