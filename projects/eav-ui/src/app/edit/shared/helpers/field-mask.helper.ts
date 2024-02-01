import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EavConfig } from '../models';
import { FieldConfigSet } from '../../form/builder/fields-builder/field-config-set.model';
import { GeneralHelpers } from './general.helpers';

/**
 * Create a new FieldMask instance and access result with resolve
 * @example
 * const mask = new FieldMask("[FirstName]", formGroup.controls);
 * const maskValue = mask.resolve();
 *
 * @param mask a string like "[FirstName] [LastName]"
 * @param model usually FormGroup controls, passed into here
 * @param overloadPreCleanValues a function which will "scrub" the found field-values
 */
export class FieldMask {
  private mask: string;
  private model: Record<string, AbstractControl>;
  private fields: string[] = [];
  private value: string;
  private findFields = /\[.*?\]/ig;
  private unwrapField = /[\[\]]/ig;
  private subscriptions: Subscription[] = [];

  constructor(
    mask: string | null,
    model: Record<string, AbstractControl>,
    private changeEvent: (newValue: string) => void,
    overloadPreCleanValues: (key: string, value: string) => string,
    private eavConfig?: EavConfig,
    private config?: FieldConfigSet,
  ) {
    this.mask = mask ?? '';
    this.value = mask ?? '';// set value to be initially same as the mask so onChange doesn't run for the first time without reason
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
    if (value.includes('[')) {
      value = GeneralHelpers.lowercaseInsideSquareBrackets(value);
      if (this.eavConfig != null) {
        value = value.replace('[app:appid]', this.eavConfig.appId);
        value = value.replace('[app:zoneid]', this.eavConfig.zoneId);
      }
      if (this.config != null && this.config != undefined) {
        value = value.replace('[guid]', this.config.entityGuid);
        value = value.replace('[id]', this.config.entityId.toString());
      }
      this.fields.forEach((e, i) => {
        const replaceValue = this.model.hasOwnProperty(e) && this.model[e] && this.model[e].value ? this.model[e].value : '';
        const cleaned = this.preClean(e, replaceValue);
        value = value.replace('[' + e.toLowerCase() + ']', cleaned);
      });
    }
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
    const maybeNew = this.resolve();
    if (this.value !== maybeNew) {
      this.changeEvent(maybeNew);
    }
    this.value = maybeNew;
  }

  /** Add watcher and execute onChange */
  private watchAllFields() {
    // add a watch for each field in the field-mask
    this.fields.forEach(field => {
      if (!this.model[field]) { return; }
      const valueSub = this.model[field].valueChanges.subscribe(value => this.onChange());
      this.subscriptions.push(valueSub);
    });
  }

  destroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}
