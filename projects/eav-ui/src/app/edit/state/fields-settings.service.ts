import { computed, inject, Injectable, Injector, OnDestroy, signal, Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types';
import { FieldLogicTools } from '../fields/logic/field-logic-tools';
import { FormulaEngine } from '../formulas/formula-engine';
import { ContentTypeSettingsHelpers } from '../shared/helpers';
import { ItemFormulaBroadcastService } from '../formulas/form-item-formula.service';
import { FormulaPromiseHandler } from '../formulas/formula-promise-handler';
import { EavItem } from '../shared/models/eav';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldSettingsUpdateHelperFactory } from './fields-settings-update.helpers';
import { FieldsSettingsConstantsService } from './fields-settings-constants.service';
import { transient } from '../../core';
import { FormConfigService } from './form-config.service';
import { FormsStateService } from './forms-state.service';
import { FieldProps } from './fields-configs.model';
import { TranslationState } from './translate-state.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { LanguageInstanceService } from '../shared/store/language-instance.service';
import { ContentTypeService } from '../shared/store/content-type.service';
import { ContentTypeItemService } from '../shared/store/content-type-item.service';
import { ItemService } from '../shared/store/item.service';
import { ComputedCacheHelper } from '../../shared/helpers/computed-cache';
import { FieldsPropsEngine } from './fields-properties-engine';
import { FieldsValuesModifiedHelper } from './fields-values-modified.helper';
import { computedWithPrev } from '../../shared/helpers/signal.helpers';

const logThis = true;
const nameOfThis = 'FieldsSettingsService';
// const logOnlyFields = ['Boolean'];

/**
 * FieldsSettingsService is responsible for handling the settings, values and validations of fields.
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsService {

  //#region injected services, constructor, clean-up

  // Shared / inherited services
  private languageSvc = inject(LanguageInstanceService);
  private formConfig = inject(FormConfigService);
  private globalConfigService = inject(GlobalConfigService);
  private formsStateService = inject(FormsStateService);
  private contentTypeService = inject(ContentTypeService);
  private contentTypeItemService = inject(ContentTypeItemService);
  private itemService = inject(ItemService);

  // Transient services for this instance only
  private constantsService = transient(FieldsSettingsConstantsService);
  private changeBroadcastSvc = transient(ItemFormulaBroadcastService);
  private formulaEngine = transient(FormulaEngine);
  private formulaPromises = transient(FormulaPromiseHandler);

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

  #reader = this.languageSvc.getEntityReader(this.formConfig.config.formId);

  /** The item - set on init, used for many other computations */
  #item = signal<EavItem>(null);

  #contentType = computed(() => (!this.#item()) ? null : this.contentTypeService.getContentTypeOfItem(this.#item()));

  /** The settings of the content-type of this item */
  public contentTypeSettings = computed(() => !this.#item()
    ? null
    : ContentTypeSettingsHelpers.initDefaultSettings(this.#reader(), this.#contentType(), this.#item().Header)
  );

  /** Signals for each field value */
  // #fieldValues = new FieldsSignalsHelper(this.itemService, this.entityReader);

  /** Start the observables etc. to monitor changes */
  init(entityGuid: string): void {

    const item = this.itemService.get(entityGuid);
    this.#item.set(item);

    const contentType = this.#contentType();
    const slotIsEmpty = this.itemService.slotIsEmpty(entityGuid);

    const modifiedChecker = new FieldsValuesModifiedHelper(this.#contentType, slotIsEmpty);

    this.formulaPromises.init(entityGuid, this.#contentType, this, modifiedChecker, this.changeBroadcastSvc);
    this.formulaEngine.init(entityGuid, this, this.formulaPromises, contentType, this.contentTypeSettings);
    this.changeBroadcastSvc.init(entityGuid, this.#reader);


    // Constant field parts which don't ever change.
    // They can only be created once the inputTypes and contentTypes are available
    const constFieldPartsOfLanguage = this.constantsService
      .init(item, contentType, this.#reader) //, this.entityReader$)
      .getUnchangingDataOfLanguage();

    // WIP trying to drop this observable, but surprisingly it fails...
    const itemAttributes = this.itemService.itemAttributesSignal(entityGuid);

    // Prepare / build FieldLogicTools for use in all the formulas / field settings updates
    const prepared = computed(() => {
      const languages = this.#reader();
      const isDebug = this.globalConfigService.isDebug();
      const isReadOnly = this.formsStateService.readOnly();

        // Logic Tools are needed when checking for settings defaults etc.
        const logicTools: FieldLogicTools = {
          eavConfig: this.formConfig.config,
          entityReader: this.#reader(),
          debug: isDebug,
          contentTypeItemService: this.contentTypeItemService,
        };
        // This factory will generate helpers to validate settings updates
        const updHelperFactory = new FieldSettingsUpdateHelperFactory(
          contentType.Metadata,
          languages, // for languages current, default, initial
          logicTools,
          isReadOnly.isReadOnly,
          slotIsEmpty,
        );
        return updHelperFactory;
    });

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

      const reader = this.#reader();
      const itmAttributes = itemAttributes();
      const formValues = reader.currentValues(itmAttributes);
      const engine = new FieldsPropsEngine(
        item,
        itmAttributes,
        formValues,
        latestFieldProps,
        constFieldPartsOfLanguage(),

        reader,
        prepared(),
        modifiedChecker,
        this.formulaEngine,
        this.formulaPromises,
      );

      const { props, valueChanges } = engine.getLatestSettingsAndValues();
          
      // TODO: 2dm - not sure why but everything seems to work without this
      // which I find very suspicious
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
}
