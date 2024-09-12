import { ServiceBase } from '../../../shared/services/service-base';
import { Injectable, inject, signal, Injector, OnDestroy, effect, computed, Signal } from '@angular/core';
import { FieldState } from '../../fields/field-state';
import { FormConfigService } from '../../form/form-config.service';
import { classLog } from '../../../shared/logging';

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
export class FieldMask extends ServiceBase /* for field-change subscription */ {
  
  log = classLog({FieldMask});

  #fieldState = inject(FieldState);
  #formConfig = inject(FormConfigService);

  constructor(private injector: Injector) {
    super();
    this.log.a('constructor');
  }

  /**
   * The result of the mask as a signal, for external use/subscribing.
   */
  public result = signal<string>('');

  #controls = this.#fieldState.group.controls;
  #fieldConfig = this.#fieldState.config;

  /**
   * The mask as a signal.
   * This allows us to use a simple value or a possibly runtime-changing mask. 
   */
  #maskSignal = signal<Signal<string>>(signal<string>(''));

  /**
   * The final mask to use - either picking the signal or the text
   * TODO: we should be able to simplify this to just use a signal
   */
  #mask = computed(() => this.#maskSignal()());

  /** Fields used in the mask */
  #fieldsUsedInMask = computed(() => this.#extractFieldNames(this.#mask()));

  // #fieldValuesSignals = inject(FieldsSettingsService).fieldValues;

  // // TODO create a multi-field signal?

  // public result2 = computed(() => {
  //   // listen to all the fields for changes
  //   this.#fieldsUsedInMask().forEach(field => {

  //   });
  // });


  /**
   * Attach any processing events before the mask is resolved the first time
   */
  public initPreClean(overloadPreCleanValues: (key: string, value: string) => string): this {
    this.log.a('initPreClean');
    this.preClean = overloadPreCleanValues;
    return this;
  }

  public init(name: string, mask: string): this {
    return this.initSignal(name, signal(mask));
  }

  public initSignal(name: string, mask: Signal<string>): this {
    this.log.extendName(`-${name}`);
    const l = this.log.fn('init', { name, mask });
    this.#maskSignal.set(mask);
    this.#updateMaskFinal();
    return l.r(this, 'first result:' + this.result());
  }

  /**
   * Activate an aggressive change logger to debug what's happening.
   * Should only be used in development, as it will log a lot of data to the console.
   */
  public logChanges(): this {
    // use logger, but if not enabled, create new just for this
    const l = this.log.enabled ? this.log : classLog({FieldMask});
    effect(() => l.a(`Mask '${this.#mask()}' value changed to: ${this.result()}`), { injector: this.injector });
    return this;
  }

  #updateMaskFinal() {
    // bind auto-watch only if needed...
    // otherwise it's just on-demand
    this.#watchAllFields();
    this.#onChange();
  }



  /**
   * Process a mask to the get the final value
   */
  #process(): string {

    // if no mask, exit early
    if (!hasPlaceholders(this.#mask()))
      return this.#mask();

    let value = lowercaseInsideSquareBrackets(this.#mask());

    if (this.#formConfig != null)
      value = value
        .replace('[app:appid]', this.#formConfig.config.appId.toString())
        .replace('[app:zoneid]', this.#formConfig.config.zoneId.toString());

    if (this.#fieldConfig != null)
      value = value
        .replace('[guid]', this.#fieldConfig.entityGuid)
        .replace('[id]', this.#fieldConfig.entityId.toString());

    this.#fieldsUsedInMask().forEach((e, i) => {
      const replaceValue = this.#controls?.[e]?.value ?? '';
      const cleaned = this.preClean(e, replaceValue);
      value = value.replace('[' + e.toLowerCase() + ']', cleaned);
    });
    return value;
  }

  /** Retrieves a list of all fields used in the mask */
  #extractFieldNames(mask: string): string[] {
    // exit early if mask very simple or not a mask
    if (!mask || !hasPlaceholders(mask))
      return [];

    const matches = mask.match(FieldsFind);
    
    // TODO: ask is this good
    if (!matches)
      return [mask];
    
    const fields: string[] = matches.map(token => token.replace(FieldUnwrap, ''));
    return fields;
  }

  /**
   * Default preClean function, if no other function was specified for this
   * Will be replaced if need be.
   */
  private preClean(key: string, value: string): string { return value; }

  /** Change-event - will only fire if it really changes */
  #onChange() {
    const maybeNew = this.#process();
    this.result.set(maybeNew);
  }

  /**
   * Add watcher and execute onChange.
   * Uses observables, since that's what angular provides on valueChanges.
   */
  #watchAllFields() {
    // add a watch for each field in the field-mask
    this.#fieldsUsedInMask().forEach(field => {
      const control = this.#controls[field];
      if (!control) return;
      const valueSub = control.valueChanges.subscribe(_ => this.#onChange());
      this.subscriptions.add(valueSub);
    });
  }
}


function hasPlaceholders(mask: string): boolean {
  return (mask ?? '').includes('[');
}

/** used for query parameters */
function lowercaseInsideSquareBrackets(value: string) {
  return value.replace(/\[([^\]]+)\]/g, (_, group) => `[${group.toLowerCase()}]`);
}
