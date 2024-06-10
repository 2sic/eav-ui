import { AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FormConfiguration } from '../models';
import { FieldConfigSet } from '../../form/builder/fields-builder/field-config-set.model';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;
const logChanges = false;

const FieldsFind = /\[.*?\]/ig;
const FieldUnwrap = /[\[\]]/ig;
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
export class FieldMask extends ServiceBase {
  /**
   * Value observable containing result of the field-mask.
   */
  public value$: BehaviorSubject<string>;

  /** Fields used in the mask */
  private fieldsUsedInMask: string[] = [];


  constructor(
    private mask: string | null,
    private model: Record<string, AbstractControl>,
    private changeEvent: (newValue: string) => void,
    overloadPreCleanValues: (key: string, value: string) => string,
    private eavConfig?: FormConfiguration,
    private fieldConfig?: FieldConfigSet,
    logName?: string,
    overrideLog?: boolean
  ) {
    super(new EavLogger('FieldMask' + (logName ? `-${logName}` : ''), overrideLog ?? logThis));
    
    this.mask = mask ?? '';
    this.value$ = new BehaviorSubject<string>(this.mask);
    this.fieldsUsedInMask = this.fieldList();

    if (overloadPreCleanValues)
      this.preClean = overloadPreCleanValues;

    // bind auto-watch only if needed...
    if (model && changeEvent)
      this.watchAllFields();

    // optionally log everything that happens during dev
    if (logChanges)
      this.subscriptions.add(
        this.value$.subscribe(value => this.log.a(`Value of mask: '${mask}' changed to: '${value}'`))
      );
  }

  

  /** Resolves a mask to the final value */
  resolve(): string {

    // if no mask, exit early
    if (!hasPlaceholders(this.mask))
      return this.mask;

    let value = lowercaseInsideSquareBrackets(this.mask);
    if (this.eavConfig != null)
      value = value
        .replace('[app:appid]', this.eavConfig.appId)
        .replace('[app:zoneid]', this.eavConfig.zoneId);

    if (this.fieldConfig != null)
      value = value
        .replace('[guid]', this.fieldConfig.entityGuid)
        .replace('[id]', this.fieldConfig.entityId.toString());

    this.fieldsUsedInMask.forEach((e, i) => {
      const replaceValue = this.model.hasOwnProperty(e) && this.model[e] && this.model[e].value ? this.model[e].value : '';
      const cleaned = this.preClean(e, replaceValue);
      value = value.replace('[' + e.toLowerCase() + ']', cleaned);
    });
    return value;
  }

  /** Retrieves a list of all fields used in the mask */
  fieldList(): string[] {
    // exit early if mask very simple or not a mask
    if (!this.mask || !hasPlaceholders(this.mask))
      return [];
    
    const result: string[] = [];
    const matches = this.mask.match(FieldsFind);
    if (matches) {
      matches.forEach((e, i) => {
        const staticName = e.replace(FieldUnwrap, '');
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
    if (this.value$.value !== maybeNew) {
      this.value$.next(maybeNew);
      this.changeEvent(maybeNew);
    }
  }

  /** Add watcher and execute onChange */
  private watchAllFields() {
    // add a watch for each field in the field-mask
    this.fieldsUsedInMask.forEach(field => {
      if (!this.model[field]) { return; }
      const valueSub = this.model[field].valueChanges.subscribe(_ => this.onChange());
      this.subscriptions.add(valueSub);
    });
  }

  destroy() {
    super.destroy();
  }
}


function hasPlaceholders(mask: string): boolean {
  return (mask ?? '').includes('[');
}

/** used for query parameters */
function lowercaseInsideSquareBrackets(value: string) {
  return value.replace(/\[([^\]]+)\]/g, (match, group) => `[${group.toLowerCase()}]`);
}