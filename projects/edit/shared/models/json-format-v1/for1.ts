import { EavFor } from '../eav';

export class For1 {
  Target: string;
  Number?: number;
  String?: string;
  Guid?: string;

  constructor(entityFor: EavFor) {
    this.Target = entityFor.Target;
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
