import { Injectable, Injector, Signal, computed, effect, inject, signal } from '@angular/core';
import { classLog } from '../../../shared/logging';
import { ServiceBase } from '../../../shared/services/service-base';
import { FieldState } from '../../fields/field-state';
import { FormConfigService } from '../../form/form-config.service';

const logSpecs = {
  all: false,
  initSignal: false,
  watchAllFields: true,
}

const dataPrefix = 'data';
const FieldsFindNoPrefix = /\[.*?\]/ig;
const FieldsFindPrefix = /\[[a-zA-Z]+\:.*?\]/ig;
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
  
  log = classLog({FieldMask}, logSpecs);

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
  #requirePrefix = false;

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

  public init(name: string, mask: string, requirePrefix: boolean = false): this {
    return this.initSignal(name, signal(mask));
  }

  public initSignal(name: string, mask: Signal<string>): this {
    this.log.extendName(`-${name}`);
    const l = this.log.fnIf('initSignal', { name, mask });
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

    // If we have form info (which we usually do), replace the placeholders
    if (this.#formConfig != null)
      value = value
        .replace('[app:appid]', this.#formConfig.config.appId.toString())
        .replace('[app:zoneid]', this.#formConfig.config.zoneId.toString());

    // If we have field info (which we usually do), replace the placeholders
    if (this.#fieldConfig != null)
      value = value
        .replace('[guid]', this.#fieldConfig.entityGuid)
        .replace('[data:guid]', this.#fieldConfig.entityGuid)
        .replace('[id]', this.#fieldConfig.entityId.toString())
        .replace('[data:id]', this.#fieldConfig.entityId.toString());

    const dataPlaceholders = this.#fieldsUsedInMask().data;
    if (!dataPlaceholders)
      return value;

    dataPlaceholders.forEach((e, i) => {
      const replaceValue = this.#controls?.[e]?.value ?? '';
      const cleaned = this.preClean(e, replaceValue);
      // New with prefix 'data:'
      value = value.replace('[data:' + e.toLowerCase() + ']', cleaned);
      // Old without prefix - only if allowed (for compatibility)
      value = value.replace('[' + e.toLowerCase() + ']', cleaned);
    });
    return value;
  }

  /** Retrieves a list of all fields used in the mask */
  #extractFieldNames(mask: string): Record<string, string[]> {
    // exit early if mask very simple or not a mask
    if (!mask || !hasPlaceholders(mask))
      return {};

    const matches = mask.match(FieldsFindNoPrefix);
    
    if (!matches)
      return {};
    
    const fields: string[] = matches.map(token => token.replace(FieldUnwrap, ''));
    return { data: fields };
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
    const l = this.log.fnIf('watchAllFields');
    const dataPlaceholders = this.#fieldsUsedInMask().data;
    if (!dataPlaceholders)
      return l.end('no data placeholders');

    // add a watch for each field in the field-mask
    const controls = dataPlaceholders
      .map(f => this.#controls[f])
      .filter(f => f != null);

    if (controls.length == 0)
      return l.end('no fields to watch');

    controls.forEach(c => this.subscriptions.add(c.valueChanges.subscribe(_ => this.#onChange())));
    l.end();
  }
}


function hasPlaceholders(mask: string): boolean {
  return (mask ?? '').includes('[');
}

/** used for query parameters */
function lowercaseInsideSquareBrackets(value: string) {
  return value.replace(/\[([^\]]+)\]/g, (_, group) => `[${group.toLowerCase()}]`);
}
