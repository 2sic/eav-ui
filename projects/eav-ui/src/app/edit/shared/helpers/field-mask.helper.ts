import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { Injectable, inject, signal, Injector, OnDestroy, effect } from '@angular/core';
import { FieldState } from '../../form/builder/fields-builder/field-state';
import { FormConfigService } from '../services';

const logThis = false;
const nameOfThis = 'FieldMask';

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
@Injectable()
export class FieldMask extends ServiceBase implements OnDestroy {

  /**
   * Field masks will usually be needed as standalone copies of each.
   * This is not what Angular does though, so we should do it like this.
   * @param injector 
   */
  static createTransient(injector: Injector): FieldMask
  {
    return Injector.create({ providers: [FieldMask], parent: injector }).get(FieldMask)
  }

  public signal = signal<string>('');

  public watch = false;

  /** Fields used in the mask */
  private fieldsUsedInMask: string[] = [];

  private fieldState = inject(FieldState);

  private controls = this.fieldState.group.controls;
  private fieldConfig = this.fieldState.config;

  protected formConfig = inject(FormConfigService);

  private callback?: (newValue: string) => void;

  private mask: string | null;

  constructor(private injector: Injector) {
    super(new EavLogger(nameOfThis, logThis));
    this.log.a('constructor');
  }

  ngOnDestroy() {
    this.destroy();
  }

  /** Attach any processing events before the mask is resolved the first time */
  public initPreClean(overloadPreCleanValues: (key: string, value: string) => string): this {
    this.log.a('initPreClean');
    this.preClean = overloadPreCleanValues;
    return this;
  }

  public initCallback(callback: (newValue: string) => void): this {
    this.log.a('initCallback');
    this.callback = callback;
    this.watch = true;
    return this;
  }

  public init(name: string, mask: string, watch?: boolean): this {
    this.log.rename(`${this.log.name}-${name}`);
    // mut happen before updateMask
    if (watch != null)
      this.watch = watch;
    this.updateMask(mask);
    return this;
  }
  
  public logChanges(): this {
    // use logger, but if not enabled, create new just for this
    const l = this.log.enabled ? this.log : new EavLogger(nameOfThis, true);
    effect(() => {
      const latest = this.signal();
      l.a(`Mask '${this.mask}' value changed to: ${latest}`);
    }, { injector: this.injector });
    return this;
  }

  
  public updateMask(mask: string) {
    this.mask = mask ?? '';
    this.fieldsUsedInMask = this.extractFieldNames(this.mask);

    // bind auto-watch only if needed...
    // otherwise it's just on-demand
    if (this.watch || this.callback)
      this.watchAllFields();

    this.onChange();
  }

  

  /** Resolves a mask to the final value */
  resolve(): string {

    // if no mask, exit early
    if (!hasPlaceholders(this.mask))
      return this.mask;

    let value = lowercaseInsideSquareBrackets(this.mask);
    if (this.formConfig != null)
      value = value
        .replace('[app:appid]', this.formConfig.config.appId)
        .replace('[app:zoneid]', this.formConfig.config.zoneId);

    if (this.fieldConfig != null)
      value = value
        .replace('[guid]', this.fieldConfig.entityGuid)
        .replace('[id]', this.fieldConfig.entityId.toString());

    this.fieldsUsedInMask.forEach((e, i) => {
      const replaceValue = this.controls.hasOwnProperty(e) && this.controls[e] && this.controls[e].value ? this.controls[e].value : '';
      const cleaned = this.preClean(e, replaceValue);
      value = value.replace('[' + e.toLowerCase() + ']', cleaned);
    });
    return value;
  }

  /** Retrieves a list of all fields used in the mask */
  private extractFieldNames(mask: string): string[] {
    // exit early if mask very simple or not a mask
    if (!mask || !hasPlaceholders(mask))
      return [];
    
    const result: string[] = [];
    const matches = mask.match(FieldsFind);
    if (matches)
      matches.forEach((fieldName) => {
        const staticName = fieldName.replace(FieldUnwrap, '');
        result.push(staticName);
      });
    else
      // TODO: ask is this good
      result.push(this.mask);
    return result;
  }

  /** Default preClean function, if no other function was specified for this */
  private preClean(key: string, value: string): string {
    return value;
  }

  /** Change-event - will only fire if it really changes */
  private onChange() {
    const maybeNew = this.resolve();
    if (this.signal() !== maybeNew) {
      this.signal.set(maybeNew);
      this.callback?.(maybeNew);
    }
  }

  /**
   * Add watcher and execute onChange.
   * Uses observables, since that's what angular provides on valueChanges.
   */
  private watchAllFields() {
    // add a watch for each field in the field-mask
    this.fieldsUsedInMask.forEach(field => {
      const control = this.controls[field];
      if (!control) return;
      const valueSub = control.valueChanges.subscribe(_ => this.onChange());
      this.subscriptions.add(valueSub);
    });
  }
}


function hasPlaceholders(mask: string): boolean {
  return (mask ?? '').includes('[');
}

/** used for query parameters */
function lowercaseInsideSquareBrackets(value: string) {
  return value.replace(/\[([^\]]+)\]/g, (match, group) => `[${group.toLowerCase()}]`);
}