import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { Injectable, inject, signal, Injector, OnDestroy, effect, computed, Signal } from '@angular/core';
import { FieldState } from '../../fields/field-state';
import { FormConfigService } from '../../state/form-config.service';

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
export class FieldMask extends ServiceBase /* for field-change subscription */ implements OnDestroy {
  public result = signal<string>('');

  #watch = signal(false);


  #fieldState = inject(FieldState);

  #controls = this.#fieldState.group.controls;
  #fieldConfig = this.#fieldState.config;

  #formConfig = inject(FormConfigService);

  #callback?: (newValue: string) => void;

  /** The mask as text */
  #maskText = signal<string | null>('');

  /** The mask as a signal - in case we attach it directly to a computed */
  #maskSignal = signal<Signal<string>>(null);
  #mask = computed(() => this.#maskSignal()?.() ?? this.#maskText());

  /** Fields used in the mask */
  // #fieldsUsedInMask: string[] = [];
  #fieldsUsedInMask = computed(() => this.#extractFieldNames(this.#mask()));

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

  /**
   * attach a callback.
   * Someday should simply be replaced to use the signal instead.
   * @param callback
   * @returns
   */
  public initCallback(callback: (newValue: string) => void): this {
    this.log.a('initCallback');
    this.#callback = callback;
    this.#watch.set(true);
    return this;
  }

  public init(name: string, mask: string, watch?: boolean): this {
    this.log.rename(`${this.log.name}-${name}`);
    const l = this.log.fn('init', { name, mask, watch });
    // mut happen before updateMask
    if (watch != null) this.#watch.set(watch);
    this.#maskText.set(mask ?? '');
    this.#updateMaskFinal();
    return l.r(this, 'first result:' + this.result());
  }

  public initSignal(name: string, mask: Signal<string>, watch?: boolean): this {
    this.log.rename(`${this.log.name}-${name}`);
    // mut happen before updateMask
    if (watch != null) this.#watch.set(watch);
    this.#maskSignal.set(mask);
    this.#updateMaskFinal();
    return this;
  }

  public logChanges(): this {
    // use logger, but if not enabled, create new just for this
    const l = this.log.enabled ? this.log : new EavLogger(nameOfThis, true);
    effect(() => {
      const latest = this.result();
      l.a(`Mask '${this.#mask()}' value changed to: ${latest}`);
    }, { injector: this.injector });
    return this;
  }

  #updateMaskFinal() {
    // bind auto-watch only if needed...
    // otherwise it's just on-demand
    if (this.#watch() || this.#callback)
      this.#watchAllFields();

    this.#onChange();
  }



  /**
   * Process a mask to the final value
   * @deprecated use result() instead - still WIP. Once all use result(), remove this warning
   */
  process(): string {

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
      const replaceValue = this.#controls.hasOwnProperty(e) && this.#controls[e] && this.#controls[e].value ? this.#controls[e].value : '';
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
    
    const result: string[] = [];
    if (matches)
      matches.forEach((fieldName) => {
        const staticName = fieldName.replace(FieldUnwrap, '');
        result.push(staticName);
      });
    return result;
  }

  /** Default preClean function, if no other function was specified for this */
  private preClean(key: string, value: string): string {
    return value;
  }

  /** Change-event - will only fire if it really changes */
  #onChange() {
    const maybeNew = this.process();
    if (this.result() !== maybeNew) {
      this.result.set(maybeNew);
      this.#callback?.(maybeNew);
    }
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
