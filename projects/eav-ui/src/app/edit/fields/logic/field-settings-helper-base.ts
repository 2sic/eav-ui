import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { classLog, ClassLogger } from '../../../shared/logging';
import { DebugFields } from '../../edit-debug';
import { FieldSettingsHelpersManager } from './field-settings-helpers-manager';
import { FieldSettingsTools } from './field-settings-tools';
import { FieldSettingsUpdateTask } from './field-settings-update-task';

const logSpecs = {
  all: false,
  constructor: true,
  update: true,
  fields: [...DebugFields, 'Icon'],
}

export abstract class FieldSettingsHelperBase {

  /** Logger - lazy created on first access if not yet created */
  get log() { return this.#log ??= classLog({FieldSettingsHelperBase}, logSpecs).extendName(`[${this.name}]`) };
  
  #log: ClassLogger<typeof logSpecs>;

  constructor(inheritingClassForLogging: Record<string, unknown> | string, logThis?: boolean) {
    this.#log = classLog(inheritingClassForLogging ?? {FieldSettingsHelperBase}, logSpecs, null, logThis);
    this.name ??= this.#log.name;
    this.log.fnIf('constructor');
  }

  /** Input type name */
  name: string;

  /** If this field supports AutoTranslate (new v15.x) */
  public canAutoTranslate = false;

  /** Quick shorthand to Register a Logic to FieldLogicManager */
  static add(logic: LogicFactory) {
    const logicInstance = new logic();
    FieldSettingsHelpersManager.singleton().add(logicInstance);
  }

  /** Run this dummy method from component to make sure Logic files are not tree shaken */
  static importMe(): void { }

  /**
   * We need to know if a value is empty, to decide if we should initialize it with a default value.
   * 
   * Special case: Entity fields for empty items are prefilled on the backend with []
   * so I can never know if entity field is brand new, or just emptied out by the user
   * 
   * Note: 2dm 2023-08-31 moved from InputFieldHelpers; in future, each logic can override this
   */
  isValueEmpty(fieldType: string, value: FieldValue, isCreateMode: boolean): boolean {
    const l = this.log.fn('isValueEmpty', { fieldType, value, isCreateMode });

    // If value is undefined, it's definitely empty
    // Note: 2026-01-08 2dm: Not sure why we only check for undefined, but this is the original logic, so we won't change it now.
    // My guess is that entities which are being edited will return null for many empty fields, so we don't want to treat null started-empty here.
    if (value === undefined)
      return l.r(true, 'value is undefined');
    
    // 2026-01-08 2dm added this special case for entity-fields which load data from a json, and they are null, not undefined
    if (fieldType === 'entity' && value === null)
      return l.r(true, 'entity field is null');

    const emptyEntityField = Array.isArray(value) && value.length === 0 && isCreateMode;

    return l.r(emptyEntityField);
  }

  /** 
   * Update field settings - typically used on init and in every formula cycle
   */
  abstract update(updateSpecs: FieldSettingsUpdateTask): FieldSettings;

  /**
   * Lookup advanced (external) configuration.
   * These are usually stored in the eavConfig.settings.
   * Needs defaults to merge for anything that is not defined in the external config.
   * As of 2026-01 only used in WYSIWYG.
   * @param possibleGuid - guid of the external config, if empty, return defaults
   * @param defaults - defaults to merge with external config
   */
  findAndMergeAdvanced<T>(tools: FieldSettingsTools, possibleGuid: string, defaults: T): T {
    if (!possibleGuid)
      return defaults;

    // Check if there were any settings provided for this guid
    // For example, WYSIWYG has advanced settings which should be merged in.
    const additionalConfig = tools.eavConfig.settings.Entities.find(e => e.Guid === possibleGuid);
    if (!additionalConfig)
      return defaults;

    const advanced = tools.reader.flatten(additionalConfig) as T;
    return { ...defaults, ...advanced };
  }
}

type LogicFactory = new (...args: any[]) => FieldSettingsHelperBase;