import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { EavWindow } from '../../../../shared/models/eav-window.model';
import { FieldLogicBase } from './field-logic-base';
import { UnknownLogic } from './field-logic-unknown';

declare const window: EavWindow;

export class FieldLogicManager {
  private logics: Record<string, FieldLogicBase> = {};

  private constructor() {
    // add unknown as a fallback for all scenarios
    this.add(new UnknownLogic());
  }

  static singleton(): FieldLogicManager {
    if (window.eavFieldLogicManager == null) {
      window.eavFieldLogicManager = new FieldLogicManager();
    }
    return window.eavFieldLogicManager;
  }

  /** Add settings logic */
  add(logic: FieldLogicBase): void {
    this.logics[logic.name] = logic;
  }

  /** Get settings logic for input type */
  get(inputTypeName: string): FieldLogicBase {
    return this.logics[inputTypeName] ?? null;
  }

  /** Get or use unknown - temporary solution v16.04 to prevent any scenario where there is none */
  getOrUnknown(inputTypeName: string): FieldLogicBase {
    return this.get(inputTypeName) ?? this.get(InputTypeConstants.Unknown);
  }
}
