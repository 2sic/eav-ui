import { FieldConstantsOfLanguage, FieldProps } from './fields-configs.model';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { EntityReader } from '../shared/helpers';
import { FormLanguage } from './form-languages.model';
import { FieldSettingsUpdateHelperFactory } from './fields-settings-update.helpers';
import { FormulaPromiseHandler } from '../formulas/formula-promise-handler';
import { FormulaEngine } from '../formulas/formula-engine';
import { EavContentType, EavEntityAttributes, EavItem } from '../shared/models/eav';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldsValuesModifiedHelper } from './fields-values-modified.helper';
import { FieldsPropsEngineCycle } from './fields-properties-engine-cycle';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { FormConfigService } from './form-config.service';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { FormsStateService } from './forms-state.service';
import { ContentTypeItemService } from '../shared/store/content-type-item.service';
import { ItemService } from '../shared/store/item.service';
import { FieldLogicTools } from '../fields/logic/field-logic-tools';
import { transient } from '../../core/transient';
import { FieldsSettingsConstantsService } from './fields-settings-constants.service';
import { FieldsSettingsService } from './fields-settings.service';
import { FieldsSignalsHelper } from './fields-signals.helper';

const logThis = false;
const nameOfThis = 'FieldsPropsEngine';

/**
 * Assistant helper to process / recalculate the value of fields and their settings.
 * 
 */
@Injectable()
export class FieldsPropsEngine {
  private log = new EavLogger(nameOfThis, logThis);

  // Shared / inherited services
  private formConfig = inject(FormConfigService);
  private globalConfigService = inject(GlobalConfigService);
  private formsStateService = inject(FormsStateService);
  private contentTypeItemService = inject(ContentTypeItemService);
  private itemService = inject(ItemService);

  // Transient services for this instance only
  private constantsService = transient(FieldsSettingsConstantsService);
  public formulaEngine = transient(FormulaEngine);
  public formulaPromises = transient(FormulaPromiseHandler);
  
  /** The item we're working on - needed by the formula engine */
  public item: EavItem;

  public get updateHelper() { return this.#updateHelper(); }
  public modifiedChecker: FieldsValuesModifiedHelper;
  private fieldsValues: FieldsSignalsHelper;

  constructor() {
  }

  /** Setup everything which won't change throughout cycles */
  init(
    fss: FieldsSettingsService,
    entityGuid: string,
    item: EavItem,
    contentType: Signal<EavContentType>,
    reader: Signal<EntityReader>,
    fieldsValues: FieldsSignalsHelper,
    forceDebug: boolean | null = null
  ): this {
    this.log.rename(`${this.log.name}[${entityGuid.substring(0, 8)}]`);
    this.log.fn('init', { entityGuid, item, contentType, reader, forceDebug });
    if (forceDebug !== null) this.log.enabled = forceDebug;

    this.item = item;
    this.languages = reader();
    this.fieldsValues = fieldsValues;

    const slotIsEmpty = this.itemService.slotIsEmpty(entityGuid);
    const ct = contentType();

    // Constant field parts which don't ever change.
    // They can only be created once the inputTypes and contentTypes are available
    this.#fieldLangConstants = this.constantsService
      .init(item, ct, reader)
      .getUnchangingDataOfLanguage();

    this.#updateHelper = this.#getPreparedParts(reader(), ct, slotIsEmpty);

    this.modifiedChecker = new FieldsValuesModifiedHelper(contentType, slotIsEmpty);
    this.formulaPromises.init(entityGuid, contentType, fss, this.modifiedChecker);
    this.formulaEngine.init(entityGuid, fss, this.formulaPromises, ct, fss.contentTypeSettings);

    this.#itemAttributes = this.itemService.itemAttributesSignal(entityGuid);
    return this;
  }

  #updateHelper: Signal<FieldSettingsUpdateHelperFactory>;

  /**
   * Constant field parts which don't ever change.
   * They can only be created once the inputTypes and contentTypes are available
   */
  #fieldLangConstants: Signal<FieldConstantsOfLanguage[]>;

  public getFieldConstants(name: string) {
    return this.#fieldLangConstants().find(f => f.fieldName === name);
  }

  #itemAttributes: Signal<EavEntityAttributes>;

  /**
   * The languages used in the form, for retrieving various things during the calculation.
   */
  languages: FormLanguage;

  /**
   * The current cycle of updating the properties.
   * Will be reset every time a new round starts.
   */
  cycle: FieldsPropsEngineCycle;

  /**
   *
   *
   * @param {ItemValuesOfLanguage} initialValues The values of the form - initialized here and to be updated until complete
   * @param {Record<string, FieldProps>} fieldProps The field props at start and during the calculation cycles (may be updated until complete)
   * @return {*}  {PropsUpdate}
   * @memberof FieldsPropsEngine
   */
  public getLatestSettingsAndValues(fieldProps: Record<string, FieldProps>): PropsUpdateResult {  
    const l = this.log.fn('getLatestSettingsAndValues');

    const initialValues = this.fieldsValues.values();

    // This should only be accessed here, so the signal is only depended on once!
    const attributes = this.#itemAttributes();

    this.cycle = new FieldsPropsEngineCycle(this, initialValues, fieldProps, attributes);
    const cycleResult = this.cycle.getCycleSettingsAndValues();

    // figure out the final changes to propagate
    const finalChanges = this.modifiedChecker.getValueUpdates(this.cycle, [], cycleResult.valueChanges, initialValues);

    return { valueChanges: finalChanges, props: cycleResult.props, values: this.cycle.values };
  }

  /**
   * Prepare / build FieldLogicTools for use in all the formulas / field settings updates
   */
  #getPreparedParts(reader: EntityReader, contentType: EavContentType, slotIsEmpty: Signal<boolean>) {
    // Prepare / build FieldLogicTools for use in all the formulas / field settings updates
    const prepared = computed(() => {
      const languages = reader;
      const isDebug = this.globalConfigService.isDebug();
      const isReadOnly = this.formsStateService.readOnly();

        // Logic Tools are needed when checking for settings defaults etc.
        const logicTools: FieldLogicTools = {
          eavConfig: this.formConfig.config,
          entityReader: reader,
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
    return prepared;
  }

}

interface PropsUpdate {
  valueChanges: ItemValuesOfLanguage;
  props: Record<string, FieldProps>;
}

interface PropsUpdateResult extends PropsUpdate {
  values: ItemValuesOfLanguage;
}