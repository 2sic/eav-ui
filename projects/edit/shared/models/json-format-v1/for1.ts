import { EavFor } from '../eav';

// TODO: Warning: this code looks identical for the class For1 and EavFor
export class For1 {
  Target: string;
  Number?: number;
  String?: string;
  Guid?: string;

  /** New in 11.11+ - if true, the backend will try to find the entity matching this request */
  Singleton?: boolean;

  constructor(entityFor: EavFor) {
    this.Target = entityFor.Target;
    this.Singleton = entityFor.Singleton;
    if (entityFor.Number) {
      this.Number = entityFor.Number;
    }
    if (entityFor.String) {
      this.String = entityFor.String;
    }
    if (entityFor.Guid) {
      this.Guid = entityFor.Guid;
    }
  }
}
