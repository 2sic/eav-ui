import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
import { EavItem } from '../shared/models/eav';
import { transient } from '../../core';
import { FormConfigService } from '../form/form-config.service';
import { FieldProps } from './fields-configs.model';
import { TranslationState } from '../localization/translate-state.model';
import { FormLanguageService } from '../form/form-language.service';
import { ContentTypeService } from '../shared/content-types/content-type.service';
import { ItemService } from './item.service';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { FieldsPropsEngine } from './fields-properties-engine';
import { FieldsPropertiesUpdates } from './fields-properties-updates';
import { FieldsSignalsHelper } from './fields-signals.helper';
import { computedObj, signalObj } from '../../shared/signals/signal.utilities';
import { ComputedAnalyzer } from '../../shared/signals/computed-analyzer';
import { classLog } from '../../shared/logging';

const logSpecs = {
  // Debug only on the following content type
  type: '', //'@String';
}
const activateAnalyzer = false;

const maxCyclesMs = 250;
const maxCyclesPerTime = 10;
const maxCyclesWarning = "Max cycles reached, stopping for this second";

/**
 * FieldsSettingsService is responsible for handling the settings, values and validations of fields.
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsService {

  //#region injected services, constructor, clean-up

  // Shared / inherited services
  #languageSvc = inject(FormLanguageService);
  #formConfig = inject(FormConfigService);
  #contentTypeSvc = inject(ContentTypeService);
  #itemSvc = inject(ItemService);

  // Transient services for this instance only
  // Note that it's not clear if we are going to use this...
  // TODO: ATM unused #settingChangeBroadcast
  // #changeBroadcastSvc = transient(ItemFormulaBroadcastService);
  #propsEngine = transient(FieldsPropsEngine);

  log = classLog({FieldsSettingsService}, logSpecs);

  constructor() { }

  disableForCleanUp(): void {
    this.log.fn('cleanUp');
    this.#disabled.set(true);
  }

  //#endregion

  /**
   * Field properties of all fields.
   * It is updated when every round of change-cycles are complete and stable.
   */
  public allProps: Signal<Record<string, FieldProps>>;

  /** Signal to force a refresh. */
  #forceRefresh = signalObj('forceRefresh', 0);

  /** Signal to disable everything. Mainly on clean-up, as the computed will still run when data is removed from cache */
  #disabled = signalObj('disabled', false);

  #fieldsPropsUpdate: FieldsPropertiesUpdates;

  #reader = this.#languageSvc.getEntityReader(this.#formConfig.config.formId);

  //#region Item and content-type

  /** The item - set on init, used for many other computations */
  #item = signal<EavItem>(null);

  #contentType = computed(() => (!this.#item()) ? null : this.#contentTypeSvc.getContentTypeOfItem(this.#item()));

  /** The settings of the content-type of this item */
  public contentTypeSettings = computed(() => !this.#item()
    ? null
    : ContentTypeSettingsHelpers.getDefaultSettings(this.#reader(), this.#contentType(), this.#item().Header)
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
    const debugOnlyCt = this.log.specs.type;
    const forceDebug = debugOnlyCt === null ? null : contentType.Id === debugOnlyCt;
    if (forceDebug !== null) {
      this.log.a(`Set debug for content type '${contentType.Id}' to ${forceDebug}, only debugging ${debugOnlyCt}`);
      this.log.forceEnable(forceDebug);
    }

    this.#fieldValues.init(entityGuid, this.#reader);

    const slotIsEmpty = this.#itemSvc.slotIsEmpty(entityGuid);

    // TODO: ATM unused #settingChangeBroadcast
    // this.#changeBroadcastSvc.init(entityGuid, this.#reader);

    this.#propsEngine.init(this, entityGuid, item, this.#contentType, this.#reader, this.#fieldValues, forceDebug);

    // Protect against infinite loops
    const watchRestart = signal(0);
    let cycle = 0;
    setInterval(() => {
      if (cycle > maxCyclesPerTime) {
        this.log.a(`restarting max cycles from ${cycle}; entityGuid: ${entityGuid}; contentTypeId: ${this.#contentType().Id}`);
        cycle = 0;
        watchRestart.update(v => v + 1);
      }
    }, maxCyclesMs);

    let prevFieldProps: Record<string, FieldProps> = {};

    let analyzer: ComputedAnalyzer<Record<string, FieldProps>>;
    this.allProps = computedObj('allFieldProps', () => {
      if (analyzer)
        console.log('analyzer', { fieldProps: this.allProps }, analyzer.snapShotProducers(true));

      const l = this.log.fn('fieldsProps', { cycle, entityGuid, contentTypeId: contentType.Id, props: this.allProps });
      // If disabled, for any reason, return the previous value
      // The #disabled is a safeguard as data will be missing when this is being cleaned up.
      // The #slotIsEmpty means that the current entity is not being edited and will not be saved; can change from cycle to cycle.
      if (this.#disabled() || slotIsEmpty())
        return l.r(prevFieldProps, 'disabled or slotIsEmpty');

      // This is triggered by promise-completed messages + v1 formulas
      this.#forceRefresh();

      // If we have reached the max cycles, we should stop
      if (cycle++ > maxCyclesPerTime) {
        const msg = `${maxCyclesWarning}; cycle: ${cycle} entityGuid: ${entityGuid}; contentTypeId: ${this.#contentType().Id}`;
        console.warn(msg);
        watchRestart(); // to ensure it can start again in a second, access this before we exit.
        return l.r(prevFieldProps, msg);
      }

      const latestFieldProps = this.#fieldsPropsUpdate.hasChanges()
        ? this.#fieldsPropsUpdate.mergeMixins(prevFieldProps)
        : prevFieldProps;
      
      // Note that this will access a lot of source signals
      // whose dependencies will be incorporated into this calculation
      const { props, valueChanges, values } = this.#propsEngine.getLatestSettingsAndValues(latestFieldProps);
      prevFieldProps = props;
          
      // TODO: 2dm - not sure why but everything seems to work without this, which I find very suspicious
      // TODO: ATM unused #settingChangeBroadcast
      // if (Object.keys(valueChanges).length > 0)
      //   this.#changeBroadcastSvc.applyValueChangesFromFormulas(valueChanges);

      return l.rSilent(props, 'normal update');
      // const propsDiff = difference(props, prevFieldProps);
      // if (Object.keys(propsDiff).length > 0) {
      //   l.a('Fields Props Diff', propsDiff);
      //   return l.r(props, `props: normal update`);
      // } else {
      //   return l.rSilent(prevFieldProps, 'props: no changes');
      // }
    });

    if (activateAnalyzer)
      analyzer = new ComputedAnalyzer(this.allProps);

    this.#fieldsPropsUpdate = new FieldsPropertiesUpdates(entityGuid, this.allProps);
  }


  #fieldPropsCache = new ComputedCacheHelper<string, FieldProps>('field-props');
  public fieldProps = this.#fieldPropsCache.buildProxy(f => () => this.allProps()[f]);
  
  #fieldSignalsCache = new ComputedCacheHelper<string, FieldSettings>('fields');
  /**
   * Used for getting field settings for a specific field.
   * @param fieldName
   * @returns Field settings
   */
  public settings = this.#fieldSignalsCache.buildProxy(f => () => this.allProps()[f].settings);

  // getTranslationState(fieldName: string): Signal<TranslationState> {
  //   return this.#signalsTransStateCache.getOrCreate(fieldName, () => this.allProps()[fieldName].translationState);
  // }
  // #signalsTransStateCache = new ComputedCacheHelper<string, TranslationState>('transl-state');
    
  /**
   * Used for translation state stream for a specific field.
   * @param fieldName
   * @returns Translation state signal
   */
  translationState = ComputedCacheHelper.proxy<string, TranslationState>('transl-state', f => () => this.allProps()[f].translationState);

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
