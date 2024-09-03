import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
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
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import isEqual from 'lodash-es/isEqual';
import { FieldsPropertiesUpdates } from './fields-properties-updates';
import { FieldsSignalsHelper } from './fields-signals.helper';
import { named, difference } from '../../shared/helpers/signal.helpers';
import { ComputedAnalyzer } from '../../shared/helpers/computed-analyzer';

const logThis = false;
const nameOfThis = 'FieldsSettingsService';
// Debug only on the following content type
const debugOnlyThisContentType = ''; //'@String';

const maxCyclesPerSecond = 10;
const maxCyclesWarning = "Max cycles reached, stopping for this second";

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
  #fieldsProps: Signal<Record<string, FieldProps>>; //({}, { equal: isEqual });

  /** Signal to force a refresh. */
  #forceRefresh = named('forceRefresh', signal(0));

  /** Signal to disable everything. Mainly on clean-up, as the computed will still run when data is removed from cache */
  #disabled = named('disabled', signal(false));

  #fieldsPropsUpdate: FieldsPropertiesUpdates;

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
  #fieldValues = transient(FieldsSignalsHelper);

  /** Start the observables etc. to monitor changes */
  init(entityGuid: string): void {

    const item = this.#itemSvc.get(entityGuid);
    this.#item.set(item);
    // Remember content-type, as it won't change and we don't need to listen to a signal
    const contentType = this.#contentType();
    const forceDebug = debugOnlyThisContentType === null ? null : contentType.Id === debugOnlyThisContentType;
    if (forceDebug !== null) {
      this.log.a(`Set debug for content type '${contentType.Id}' to ${forceDebug}, only debugging ${debugOnlyThisContentType}`);
      this.log.enabled = forceDebug;
    }

    this.#fieldValues.init(entityGuid, this.#reader);

    const slotIsEmpty = this.#itemSvc.slotIsEmpty(entityGuid);

    // TODO: ATM unused #settingChangeBroadcast
    // this.#changeBroadcastSvc.init(entityGuid, this.#reader);

    this.#propsEngine.init(this, entityGuid, item, this.#contentType, this.#reader, this.#fieldValues, forceDebug);

    // Protect against infinite loops
    let cycle = 0;
    setInterval(() => {
      if (cycle > maxCyclesPerSecond)
        this.log.a(`restarting max cycles from ${cycle}; entityGuid: ${entityGuid}; contentTypeId: ${this.#contentType().Id}`);
      cycle = 0;
    }, 1000);

    let prevFieldProps: Record<string, FieldProps> = {};
    let prevValues: ItemValuesOfLanguage = {};

    let analyzer: ComputedAnalyzer<Record<string, FieldProps>>;
    this.#fieldsProps = computed(() => {
      if (analyzer)
        console.log('analyzer', { fieldProps: this.#fieldsProps }, analyzer.snapShotProducers(true));

      const l = this.log.fn('fieldsProps', { cycle, entityGuid, contentTypeId: contentType.Id, props: this.#fieldsProps });
      // If disabled, for any reason, return the previous value
      // The #disabled is a safeguard as data will be missing when this is being cleaned up.
      // The #slotIsEmpty means that the current entity is not being edited and will not be saved; can change from cycle to cycle.
      if (this.#disabled() || slotIsEmpty())
        return l.r(prevFieldProps, 'disabled or slotIsEmpty');

      // This is triggered by promise-completed messages + v1 formulas
      this.#forceRefresh();

      // If we have reached the max cycles, we should stop
      if (cycle++ > maxCyclesPerSecond) {
        const msg = `${maxCyclesWarning}; cycle: ${cycle} entityGuid: ${entityGuid}; contentTypeId: ${this.#contentType().Id}`;
        console.warn(msg);
        return l.r(prevFieldProps, msg);
      }

      const latestFieldProps = this.#fieldsPropsUpdate.hasChanges()
        ? this.#fieldsPropsUpdate.mergeMixins(prevFieldProps)
        : prevFieldProps;
      
      // Note that this will access a lot of source signals
      // whose dependencies will be incorporated into this calculation
      const { props, valueChanges, values } = this.#propsEngine.getLatestSettingsAndValues(latestFieldProps);
      const propsDiff = difference(props, prevFieldProps);
      prevValues = values;
      prevFieldProps = props;
          
      // TODO: 2dm - not sure why but everything seems to work without this, which I find very suspicious
      // TODO: ATM unused #settingChangeBroadcast
      // if (Object.keys(valueChanges).length > 0)
      //   this.#changeBroadcastSvc.applyValueChangesFromFormulas(valueChanges);

      if (Object.keys(propsDiff).length > 0) {
        l.a('Fields Props Diff', propsDiff);
        return l.r(props, `props: normal update`);
      } else {
        return l.rSilent(prevFieldProps, 'props: no changes');
      }
    }, { equal: isEqual } );

    analyzer = new ComputedAnalyzer(this.#fieldsProps);

    this.#fieldsPropsUpdate = new FieldsPropertiesUpdates(entityGuid, this.#fieldsProps);
  }

  #testAnalyzers() {
    // temp computed to analyze dependencies
    const x = named('x', signal(27));
    const y = named('y', signal(42)); // indirect dependency
    const z = named('z', computed(() => x() + y()));
    const tempFromDisabled = computed(() => {
      return x() + " / " + z();
    });
    
    const analyzerTemp = new ComputedAnalyzer(tempFromDisabled);
    
    let valSubscribe = tempFromDisabled();
    console.log('snapshot before', {tempFromDisabled}, analyzerTemp.snapShotProducers());

    // make a change
    x.set(28);
    console.log('snapshot in between', {tempFromDisabled}, analyzerTemp.snapShotProducers());
    valSubscribe = tempFromDisabled();
    
    // console.log('analyzerTemp computed', tempFromDisabled);
    // console.log('analyzerTemp producers', analyzerTemp.getDirtyProducers());
    console.log('snapshot after', {tempFromDisabled}, analyzerTemp.snapShotProducers());

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
  #fieldSignalsCache = new ComputedCacheHelper<string, FieldSettings>('fields');

  /**
   * Used for translation state stream for a specific field.
   * @param fieldName
   * @returns Translation state stream
   */
  getTranslationState(fieldName: string): Signal<TranslationState> {
    return this.#signalsTransStateCache.getOrCreate(fieldName, () => this.#fieldsProps()[fieldName].translationState);
  }
  #signalsTransStateCache = new ComputedCacheHelper<string, TranslationState>('transl-state');

  /**
   * Triggers a reevaluation of all formulas.
   */
  retriggerFormulas(source: string): void {
    this.log.fn('retriggerFormulas', { source});
    this.#forceRefresh.update(v => v + 1);
  }

  //#region Update Settings of a field

  /**
   * Modify a setting, ATM just to set collapsed / dialog-open states.
   * Note that this change won't fire the formulas - which may not be correct.
   */
  updateSetting(fieldName: string, update: Partial<FieldSettings>, source: string): void {
    this.#fieldsPropsUpdate.updateSetting(fieldName, update, source);
    
    // Retrigger formulas if the queue was empty (otherwise it was already retriggered and will run soon)
    // Put a very small delay into processing the queue, since startup can send single updates for many fields one at a time.
    setTimeout(() => this.retriggerFormulas('updateSetting'), 10);
  }

}
