import { FieldLogicBase } from './field-logic-base';

interface EavProps {
  eavFieldLogicManager: FieldLogicManager;
}

type EavWindow = typeof window & EavProps;

export class FieldLogicManager {
  private logics: { [key: string]: FieldLogicBase } = {};

  private constructor() { }

  static singleton(): FieldLogicManager {
    const eavWindow = window as EavWindow;
    if (eavWindow.eavFieldLogicManager == null) {
      eavWindow.eavFieldLogicManager = new FieldLogicManager();
    }
    return eavWindow.eavFieldLogicManager;
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
