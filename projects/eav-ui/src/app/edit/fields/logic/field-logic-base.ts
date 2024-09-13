import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { classLog } from '../../../shared/logging';
import { ClassLogger } from '../../../shared/logging';
import { FieldLogicManager } from './field-logic-manager';
import { FieldLogicTools } from './field-logic-tools';

type LogicConstructor = new (...args: any[]) => FieldLogicBase;

export abstract class FieldLogicBase {

  get log() { return this.#log ??= classLog({FieldLogicBase}).extendName(`[${this.name}]`) };
  #log: ClassLogger;

  // TODO: @2pp make sure it's in all the constructors of theinheriting Logic classes
  constructor(inheritingClass: Record<string, unknown> | string, logThis?: boolean) {
    if(!this.name)
      return
    
    this.#log = classLog(inheritingClass ?? {FieldLogicBase}, null, logThis);
    this.name ??= this.#log.name;
    this.log.a(`constructor for ${inheritingClass}`);
  }

  /** Input type name */
  name: string;

  /** If this field supports AutoTranslate (new v15.x) */
  public canAutoTranslate = false;

  /** Adds Logic to FieldLogicManager */
  static add(logic: LogicConstructor) {
    const logicInstance = new logic();
    FieldLogicManager.singleton().add(logicInstance);
  }

  /** Run this dummy method from component to make sure Logic files are not tree shaken */
  static importMe(): void { }

  /**
   * Entity fields for empty items are prefilled on the backend with []
   * so I can never know if entity field is brand new, or just emptied out by the user
   * 
   * Note: 2dm 2023-08-31 moved from InputFieldHelpers; in future, each logic can override this
   */
  isValueEmpty(value: FieldValue, isCreateMode: boolean): boolean {
    const l = this.log.fn('isValueEmpty', { value, isCreateMode });
    const emptyEntityField = Array.isArray(value) && value.length === 0 && isCreateMode;
    return l.r(value === undefined || emptyEntityField);
  }

  /** 
   * Update field settings - typically used on init and in every formula cycle
   */
  abstract update(updateSpecs: FieldLogicUpdate): FieldSettings;

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

export interface FieldLogicUpdate<T = FieldValue> {
  /** Settings before logic update */
  settings: FieldSettings;

  /** Tools for doing various kind of work in the logic, which is singleton and may need context-specific tools */
  tools: FieldLogicTools;

  /** The field value which the settings-update sometimes needs to know, eg. to indicated selected option in a dropdown */
  value?: T;
}