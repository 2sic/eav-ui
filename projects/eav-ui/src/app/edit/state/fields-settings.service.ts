import { computed, effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { transient } from '../../../../../core';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../shared/logging';
import { ComputedAnalyzer } from '../../shared/signals/computed-analyzer';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { computedObj, signalObj } from '../../shared/signals/signal.utilities';
import { PickerData } from '../fields/picker/picker-data';
import { FormConfigService } from '../form/form-config.service';
import { FormLanguageService } from '../form/form-language.service';
import { TranslationState } from '../localization/translate-state.model';
import { ContentTypeService } from '../shared/content-types/content-type.service';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
import { EavItem } from '../shared/models/eav';
import { FieldProps } from './fields-configs.model';
import { FieldsPropsEngine } from './fields-properties-engine';
import { FieldsPropertiesUpdates } from './fields-properties-updates';
import { FieldSettingsPickerUpdater } from './fields-settings-picker-updater';
import { FieldsSignalsHelper } from './fields-signals.helper';
import { ItemService } from './item.service';

const logSpecs = {
  effectTransferPickerData: true,
  regenerateProps: true,
  // Debug only on the following content type
  type: '', //'@String';
  activateAnalyzer: false,
}

const maxCyclesMs = 250;
const maxCycleRestartDelay = 500;
const maxCyclesPerTime = 10;
const maxCyclesWarning = "Max cycles reached, stopping for this second";

/**
 * FieldsSettingsService is responsible for handling the settings, values and validations of fields.
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsService {

  log = classLog({FieldsSettingsService}, logSpecs);

  #pickerSync = new FieldSettingsPickerUpdater();

  constructor() {

    // Signal to combine startSync and computed allProps
    const allPropsOrNull = computedObj<Record<string, FieldProps> | null>('allPropsOrNull', () => this.#startSync() && this.#allProps());

    // Transfer changes to the props state to the public property
    effect(
      () => {
        const update = allPropsOrNull();
        if (!update) return;
        this.allProps.set(update);
      },
      { allowSignalWrites: true }
    );

    // Start the picker sync
    this.#pickerSync.startSync(allPropsOrNull);
  }

  //#region injected services, constructor, clean-up

  // Shared / inherited services
  #languageSvc = inject(FormLanguageService);
  #formConfig = inject(FormConfigService);
  #contentTypeSvc = inject(ContentTypeService);
  #itemSvc = inject(ItemService);

  // Transient services for this instance only
  #propsEngine = transient(FieldsPropsEngine);

  disableForCleanUp(): void {
    this.log.fn('cleanUp');
    this.#disabled.set(true);
  }

  //#endregion

  /**
   * Field properties of all fields.
   * It is updated when every round of change-cycles are complete and stable.
   */
  public allProps = signalObj<Record<string, FieldProps>>('allProps', {});
  #startSync = signal(false);
  #allProps: Signal<Record<string, FieldProps>>;

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
    this.#fieldsPropsUpdate = new FieldsPropertiesUpdates(entityGuid);

    // Remember content-type, as it won't change and we don't need to listen to a signal
    const ct = this.#contentType();
    const debugOnlyCt = this.log.specs.type;
    const forceDebug = debugOnlyCt === null ? null : ct.Id === debugOnlyCt;
    if (forceDebug !== null) {
      this.log.a(`Set debug for content type '${ct.Id}' to ${forceDebug}, only debugging ${debugOnlyCt}`);
      this.log.forceEnable(forceDebug);
    }

    const slotIsEmpty = this.#itemSvc.slotIsEmpty(entityGuid);
    this.#fieldValues.init(entityGuid, this.#reader);
    this.#propsEngine.init(this, entityGuid, item, this.#contentType, this.#reader, this.#fieldValues, forceDebug);

    // properties for the computation - set on an object, so we can do the call in a function
    // and change what we'll do with it.
    const deps: Deps = {
      idMsg: `entityGuid: ${entityGuid}; contentTypeId: ${ct.Id};`,
      cycle: 0,
      analyzer: null as ComputedAnalyzer<Record<string, FieldProps>>,
      disabled: this.#disabled,
      slotIsEmpty,
      slotWasEmpty: false, // must start false, so it will certainly run once.
      forceRefresh: this.#forceRefresh,
      watchRestart: signal(0),
      prevFieldProps: {} as Record<string, FieldProps>,
      hasRunOnce: false,
    } satisfies Deps;
    
    // Protect against infinite loops
    setInterval(() => {
      // If we ran into a max-count, we should reset and trigger the watchRestart
      if (deps.cycle > maxCyclesPerTime)
        setTimeout(() => {
          this.log.a(`restarting max cycles from ${deps.cycle}; ${deps.idMsg}`);
          return deps.watchRestart.update(v => v + 1);
        }, maxCycleRestartDelay);
      // Every interval, reset the cycle count
      deps.cycle = 0;
    }, maxCyclesMs);

    // This computed will contain all the updated field properties
    this.#allProps = computedObj('allFieldProps', () => this.#regenerateProps(deps));

    // Start Analyzer if necessary
    if (this.log.specs.activateAnalyzer)
      deps.analyzer = new ComputedAnalyzer(this.#allProps);

    this.#startSync.set(true);
  }

  #regenerateProps(deps: Deps): Record<string, FieldProps> {
    if (deps.analyzer)
      console.log('analyzer', { fieldProps: this.allProps }, deps.analyzer.snapShotProducers(true));

    const l = this.log.fnIf('regenerateProps', { cycle: deps.cycle, props: this.allProps }, deps.idMsg);
    // If disabled for any reason, return the previous value (but do make sure there is a previous value)
    // The #disabled is a safeguard as data will be missing when this is being cleaned up.
    // The #slotIsEmpty means that the current entity is not being edited and will not be saved; can change from cycle to cycle.
    const slotIsEmpty = deps.slotIsEmpty();
    const justReuse = this.#disabled() || (slotIsEmpty && slotIsEmpty == deps.slotWasEmpty);
    if (justReuse && deps.hasRunOnce)
      return l.r(deps.prevFieldProps, 'disabled or slotIsEmpty');
    else {
      deps.hasRunOnce = true;
      deps.slotWasEmpty = slotIsEmpty;
    }

    // Listen to ForceRefresh. This is triggered by a) promise-completed messages and b) v1 formulas
    this.#forceRefresh();

    // If we have reached the max cycles, we should stop
    if (deps.cycle++ > maxCyclesPerTime) {
      const msg = `${maxCyclesWarning}; cycle: ${deps.cycle}; ${deps.idMsg};`;
      console.warn(msg);
      deps.watchRestart(); // to ensure it can start again in a second, access this before we exit.
      return l.r(deps.prevFieldProps, msg);
    }

    const latestFieldProps = this.#fieldsPropsUpdate.hasChanges()
      ? this.#fieldsPropsUpdate.mergeMixins(deps.prevFieldProps)
      : deps.prevFieldProps;
    
    // Note that this will access a lot of source signals
    // whose dependencies will be incorporated into this calculation
    const props = this.#propsEngine.getLatestSettingsAndValues(latestFieldProps);
    deps.prevFieldProps = props;
        
    return l.rSilent(props, 'normal update');
    // const propsDiff = difference(props, prevFieldProps);
    // if (Object.keys(propsDiff).length > 0) {
    //   l.a('Fields Props Diff', propsDiff);
    //   return l.r(props, `props: normal update`);
    // } else {
    //   return l.rSilent(prevFieldProps, 'props: no changes');
    // }
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
  updateSetting<T extends FieldSettings>(fieldName: string, update: Partial<T>, source: string): void {
    this.#fieldsPropsUpdate.updateSetting(fieldName, update, source, this.allProps);
    
    // Retrigger formulas if the queue was empty (otherwise it was already retriggered and will run soon)
    // Put a very small delay into processing the queue, since startup can send single updates for many fields one at a time.
    setTimeout(() => this.retriggerFormulas('updateSetting'), 10);
  }


  //#endregion

  /**
   * WIP
   * Field States for every field.
   * ATM just used for formulas which have data-sources.
   */
  public get pickerData(): Record<string, PickerData> { return this.#propsEngine.pickerData; };
}

interface Deps {
  idMsg: string,
  cycle: number,
  analyzer: ComputedAnalyzer<Record<string, FieldProps>>,
  disabled: Signal<boolean>,
  slotIsEmpty: Signal<boolean>,
  forceRefresh: Signal<number>,
  watchRestart: WritableSignal<number>,
  prevFieldProps: Record<string, FieldProps>,

  /**
   * Informs that on a previous run, the slot was empty.
   * This is important, since we don't want to run the same cycle again if the slot is empty.
   * But if it started empty, or was set back to empty, the formulas must run once
   * to correct disabled state of all fields.
   */
  slotWasEmpty: boolean,

  hasRunOnce: boolean,
}