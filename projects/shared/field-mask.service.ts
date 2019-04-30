import { AbstractControl } from '@angular/forms';

/**
 * Create a new FieldMaskService instance and access result with resolve
 * @example
 * const mask = new FieldMaskService("[FirstName]", formGroup.controls);
 * const maskValue = mask.resolve();
 *
 * @param mask a string like "[FirstName] [LastName]"
 * @param model usually FormGroup controls, passed into here
 * @param overloadPreCleanValues a function which will "scrub" the found field-values
 */
export class FieldMaskService {
  private mask: string;
  private model: { [key: string]: AbstractControl; };
  private fields: string[] = [];
  private findFields = /\[.*?\]/ig;
  private unwrapField = /[\[\]]/ig;

  constructor(
    mask: string,
    overloadPreCleanValues: (key: string, value: string) => string,
    model: { [key: string]: AbstractControl; },
  ) {
    this.mask = mask;
    this.model = model;
    this.fields = this.fieldList();

    if (overloadPreCleanValues) {
      this.preClean = overloadPreCleanValues;
    }
  }

  /** Retrieves a list of all fields used in the mask */
  public fieldList(): string[] {
    const result: string[] = [];
    if (!this.mask) { return result; }
    const matches = this.mask.match(this.findFields);
    if (matches) {
      matches.forEach((e, i) => {
        const staticName = e.replace(this.unwrapField, '');
        result.push(staticName);
      });
    } else { // TODO: ask is this good
      result.push(this.mask);
    }
    return result;
  }

  /** Resolves a mask to the final value */
  public resolve(): string {
    let value = this.mask;
    this.fields.forEach((e, i) => {
      const replaceValue = this.model.hasOwnProperty(e) && this.model[e] && this.model[e].value ? this.model[e].value : '';
      const cleaned = this.preClean(e, replaceValue);
      value = value.replace('[' + e + ']', cleaned);
    });

    return value;
  }

  /** Default preClean function */
  private preClean(key: string, value: string): string {
    return value;
  }
}
