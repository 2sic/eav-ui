import { For1 } from '../json-format-v1';

// TODO: Warning: this code looks identical for the class For1 and EavFor

export class EavFor {
  Target: string;
  Number?: number;
  String?: string;
  Guid?: string;

  /** New in 11.11+ - if true, the backend will try to find the entity matching this request */
  Singleton?: boolean;

  constructor(itemFor: For1) {
    this.Target = itemFor.Target;
    this.Singleton = itemFor.Singleton;
    if (itemFor.Number) {
      this.Number = itemFor.Number;
    }
    if (itemFor.String) {
      this.String = itemFor.String;
    }
    if (itemFor.Guid) {
      this.Guid = itemFor.Guid;
    }
  }
}
