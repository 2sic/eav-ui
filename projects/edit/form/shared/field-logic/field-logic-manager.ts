import { Dictionary } from '../../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { EavWindow } from '../../../../ng-dialogs/src/app/shared/models/eav-window.model';
import { FieldLogicBase } from './field-logic-base';

declare const window: EavWindow;

export class FieldLogicManager {
  private logics: Dictionary<FieldLogicBase> = {};

  private constructor() { }

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
}
