import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { classLog } from '../../../shared/logging';
import { FieldLogicBase } from './field-settings-helper-base';
import { FieldSettingsHelperUnknown } from './field-settings-helper-unknown';

const logSpecs = {
  all: false,
  get: false,
}

/** Keep the singleton FieldLogicManager on the Window object - probably not the best way to do this? */
declare global {
  interface Window {
    eavFieldSettingsHelpersManagerSingleton: FieldSettingsHelpersManager;
  }
}

/**
 * Manages all Field Settings Helpers.
 * 
 * Use this to get a specific field-settings helper for each input type.
 */
export class FieldSettingsHelpersManager {
  log = classLog({ FieldSettingsHelpersManager}, logSpecs);

  // Private constructor to enforce singleton pattern
  private constructor() {
    // add unknown as a fallback for all scenarios
    this.add(new FieldSettingsHelperUnknown());
  }

  static singleton(): FieldSettingsHelpersManager {
    // Keep the singleton FieldLogicManager on the Window object - probably not the best way to do this?
    return window.eavFieldSettingsHelpersManagerSingleton ??= new FieldSettingsHelpersManager();
  }

  #helpers: Record<string, FieldLogicBase> = {};

  /** Add settings logic */
  add(logic: FieldLogicBase): void {
    this.#helpers[logic.name] = logic;
  }

  /** Get settings logic for input type */
  get(inputTypeName: string): FieldLogicBase {
    const l = this.log.fnIf('get', { inputTypeName });
    const r = this.#helpers[inputTypeName] ?? null;
    return l.r(r);
  }

  /** Get or use unknown - temporary solution v16.04 to prevent any scenario where there is none */
  getOrUnknown(inputTypeName: string): FieldLogicBase {
    return this.get(inputTypeName) ?? this.get(InputTypeCatalog.Unknown);
  }
}
