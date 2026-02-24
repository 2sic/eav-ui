import { classLog } from '../../../../../../shared/logging';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from './field-settings-helper-base';
import { FieldSettingsHelperUnknown } from './field-settings-helper-unknown';

const logSpecs = {
  all: false,
  get: false,
  getExact: false,
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

  #helpers: Record<string, FieldSettingsHelperBase> = {};

  /** Add settings logic */
  add(logic: FieldSettingsHelperBase): void {
    this.#helpers[logic.name] = logic;
  }

  /**
   * Get settings logic for input type
   * Note: 2026-01-08 changed to always return unknown if not found, to prevent any scenario where there is none.
   * Previously this was a separate getOrUnknown method marked as temporary v16.04
   */
  get(inputTypeName: string): FieldSettingsHelperBase {
    const l = this.log.fnIf('get', { inputTypeName });
    const helper = this.getExact(inputTypeName);
    return helper
      ? l.r(helper, `found logic for ${inputTypeName}`)
      : l.r(this.getExact(InputTypeCatalog.Unknown), `using unknown logic for ${inputTypeName}`);
  }
  
  /** Get settings logic for input type */
  getExact(inputTypeName: string): FieldSettingsHelperBase {
    const l = this.log.fnIf('getExact', { inputTypeName });
    const r = this.#helpers[inputTypeName] ?? null;
    return l.r(r, `found logic: ${r != null}`);
  }

}
