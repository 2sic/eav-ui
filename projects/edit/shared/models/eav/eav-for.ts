import { For1 } from '../json-format-v1';

export class EavFor {
  Target: string;
  Number?: number;
  String?: string;
  Guid?: string;

  constructor(itemFor: For1) {
    this.Target = itemFor.Target;
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
