import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

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
  private value: string;
  private findFields = /\[.*?\]/ig;
  private unwrapField = /[\[\]]/ig;
  private subscriptions: Subscription[] = [];

  constructor(
    mask: string,
    model: { [key: string]: AbstractControl; },
    private changeEvent: (newValue: string) => any,
    overloadPreCleanValues: (key: string, value: string) => string,
  ) {
    this.mask = mask;
    this.model = model;
    this.fields = this.fieldList();

    if (overloadPreCleanValues) {
      this.preClean = overloadPreCleanValues;
    }

    // bind auto-watch only if needed...
    if (model && changeEvent) {
      this.watchAllFields();
    }
  }

  /** Resolves a mask to the final value */
  resolve(): string {
    let value = this.mask;
    this.fields.forEach((e, i) => {
      const replaceValue = this.model.hasOwnProperty(e) && this.model[e] && this.model[e].value ? this.model[e].value : '';
      const cleaned = this.preClean(e, replaceValue);
      value = value.replace('[' + e + ']', cleaned);
    });

    return value;
  }

  /** Retrieves a list of all fields used in the mask */
  fieldList(): string[] {
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

  /** Default preClean function */
  private preClean(key: string, value: string): string {
    return value;
  }

  /** Change-event - will only fire if it really changes */
  private onChange() {
    console.log('StringTemplatePickerComponent onChange called');
    const maybeNew = this.resolve();
    if (this.value !== maybeNew) {
      this.changeEvent(maybeNew);
    }
    this.value = maybeNew;
  }

  /** Add watcher and execute onChange */
  private watchAllFields() {
    console.log('StringTemplatePickerComponent watchAllFields called');
    // add a watch for each field in the field-mask
    this.fields.forEach(field => {
      const valSub = this.model[field].valueChanges.subscribe(value => this.onChange());
      this.subscriptions.push(valSub);
    });
  }

  destroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
