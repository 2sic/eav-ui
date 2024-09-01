import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
import { ItemFormulaBroadcastService } from '../formulas/form-item-formula.service';
import { EavItem } from '../shared/models/eav';
import { EavLogger } from '../../shared/logging/eav-logger';
import { transient } from '../../core';
import { FormConfigService } from './form-config.service';
import { FieldProps } from './fields-configs.model';
import { TranslationState } from './translate-state.model';
import { LanguageInstanceService } from '../shared/store/language-instance.service';
import { ContentTypeService } from '../shared/store/content-type.service';
import { ItemService } from '../shared/store/item.service';
import { ComputedCacheHelper } from '../../shared/helpers/computed-cache';
import { FieldsPropsEngine } from './fields-properties-engine';
import { computedWithPrev } from '../../shared/helpers/signal.helpers';

const logThis = false;
const nameOfThis = 'FieldsSettingsService';

/**
 * FieldsSettingsService is responsible for handling the settings, values and validations of fields.
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsService {

  //#region injected services, constructor, clean-up

  // Shared / inherited services
  #languageSvc = inject(LanguageInstanceService);
  #formConfig = inject(FormConfigService);
  #contentTypeSvc = inject(ContentTypeService);
  #itemSvc = inject(ItemService);

  // Transient services for this instance only
  // Note that it's not clear if we are going to use this...
  // TODO: ATM unused #settingChangeBroadcast
  // #changeBroadcastSvc = transient(ItemFormulaBroadcastService);
  #propsEngine = transient(FieldsPropsEngine);

  log = new EavLogger(nameOfThis, logThis);

  constructor() { }

  cleanUp(): void {
    this.log.fn('cleanUp');
    this.#disabled.set(true);
  }

  //#endregion

  /** Released field properties after the cycles of change are done */
  #fieldsProps: Signal<Record<string, FieldProps>>;

  /** Signal to force a refresh. */
  #forceRefresh = signal(0);

  /** Signal to disable everything. Mainly on clean-up, as the computed will still run when data is removed from cache */
  #disabled = signal(false);

  #fieldPropsMixins: Record<string, Partial<FieldSettings>> = {};

  #reader = this.#languageSvc.getEntityReader(this.#formConfig.config.formId);

  //#region Item and content-type

  /** The item - set on init, used for many other computations */
  #item = signal<EavItem>(null);

  #contentType = computed(() => (!this.#item()) ? null : this.#contentTypeSvc.getContentTypeOfItem(this.#item()));

  /** The settings of the content-type of this item */
  public contentTypeSettings = computed(() => !this.#item()
    ? null
    : ContentTypeSettingsHelpers.initDefaultSettings(this.#reader(), this.#contentType(), this.#item().Header)
  );

  //#endregion

  /** Signals for each field value */
  // #fieldValues = new FieldsSignalsHelper(this.itemService, this.entityReader);

  /** Start the observables etc. to monitor changes */
  init(entityGuid: string): void {

    const item = this.#itemSvc.get(entityGuid);
    this.#item.set(item);

    const slotIsEmpty = this.#itemSvc.slotIsEmpty(entityGuid);

    // TODO: ATM unused #settingChangeBroadcast
    // this.#changeBroadcastSvc.init(entityGuid, this.#reader);

    this.#propsEngine.init(this, entityGuid, item, this.#contentType, this.#reader);

    this.#fieldsProps = computedWithPrev(prevFieldProps => {
      // If disabled, return the previous value
      // This is just a safeguard as data will be missing when this is being cleaned up
      if (this.#disabled())
        return prevFieldProps;

      // Just watchers for change detection
      slotIsEmpty();
      // This is triggered by promise-completed messages + v1 formulas
      this.#forceRefresh();

      const latestFieldProps = (Object.keys(this.#fieldPropsMixins).length)
        ? this.#mergeMixins(prevFieldProps)
        : prevFieldProps;
      
      // Note that this will access a lot of source signals
      // whose dependencies will be incorporated into this calculation
      const { props, valueChanges } = this.#propsEngine.getLatestSettingsAndValues(latestFieldProps);
          
      // TODO: 2dm - not sure why but everything seems to work without this, which I find very suspicious
      // TODO: ATM unused #settingChangeBroadcast
      // if (Object.keys(valueChanges).length > 0)
      //   this.changeBroadcastSvc.applyValueChangesFromFormulas(valueChanges);

      return props;
    }, {} as Record<string, FieldProps>);

  }

  /**
   * Used to get field properties for all fields.
   * @returns Object that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps(): Record<string, FieldProps> {
    return this.#fieldsProps();
  }

  getFieldsPropsSignal(): Signal<Record<string, FieldProps>> {
    return this.#fieldsProps;
  }

  /**
   * Used for getting field settings for a specific field.
   * @param fieldName
   * @returns Field settings
   */
  getFieldSettings(fieldName: string): FieldSettings {
    return this.#fieldsProps()[fieldName].settings;
  }

  getFieldSettingsSignal(fieldName: string): Signal<FieldSettings> {
    /* will access the signal internally, so it's "hot" */
    return this.#fieldSignalsCache.getOrCreate(fieldName, () => this.getFieldSettings(fieldName));
  }
  #fieldSignalsCache = new ComputedCacheHelper<string, FieldSettings>();

  /**
   * Used for translation state stream for a specific field.
   * @param fieldName
   * @returns Translation state stream
   */
  getTranslationState(fieldName: string): Signal<TranslationState> {
    return this.#signalsTransStateCache.getOrCreate(fieldName, () => this.#fieldsProps()[fieldName].translationState);
  }
  #signalsTransStateCache = new ComputedCacheHelper<string, TranslationState>();

  /**
   * Triggers a reevaluation of all formulas.
   */
  retriggerFormulas(): void {
    this.#forceRefresh.update(v => v + 1);
  }

  //#region Update Settings of a field

  /**
   * Modify a setting, ATM just to set collapsed / dialog-open states.
   * Note that this change won't fire the formulas - which may not be correct.
   */
  updateSetting(fieldName: string, update: Partial<FieldSettings>): void {
    this.log.fn('updateSetting', { fieldName, update });
    this.#fieldPropsMixins[fieldName] = update;
    this.retriggerFormulas();
  }

  #mergeMixins(before: Record<string, FieldProps>) {
    const l = this.log.fn('mergeMixins', { before, mixins: this.#fieldPropsMixins });
    const mixins = this.#fieldPropsMixins;
    if (Object.keys(mixins).length === 0)
      return before;

    const final = Object.keys(mixins).reduce((acc, key) => {
      const ofField = acc[key];
      const update = mixins[key];
      return {
        ...acc,
        [key]: {
          ...ofField,
          settings: { ...ofField.settings, ...update }
        }
      };
    }, before);

    this.#fieldPropsMixins = {};
    return l.r(final);
  }

  //#endregion
}
