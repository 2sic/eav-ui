import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { classLog } from '../../../shared/logging';
import { FieldLogicBase } from './field-logic-base';
import { UnknownLogic } from './field-logic-unknown';

const logSpecs = {
  all: false,
  get: true,
}

// declare const window; //: EavWindow;

declare global {
  interface Window {
    eavFieldLogicManager: FieldLogicManager;
  }
}

export class FieldLogicManager {
  private logics: Record<string, FieldLogicBase> = {};

  log = classLog({FieldLogicManager}, logSpecs);

  private constructor() {
    // add unknown as a fallback for all scenarios
    this.add(new UnknownLogic());
  }

  static singleton(): FieldLogicManager {
    return window.eavFieldLogicManager ??= new FieldLogicManager();
  }

  /** Add settings logic */
  add(logic: FieldLogicBase): void {
    this.logics[logic.name] = logic;
  }

  /** Get settings logic for input type */
  get(inputTypeName: string): FieldLogicBase {
    const l = this.log.fnIf('get', { inputTypeName });
    const r = this.logics[inputTypeName] ?? null;
    return l.r(r);
  }

  /** Get or use unknown - temporary solution v16.04 to prevent any scenario where there is none */
  getOrUnknown(inputTypeName: string): FieldLogicBase {
    return this.get(inputTypeName) ?? this.get(InputTypeCatalog.Unknown);
  }
}
