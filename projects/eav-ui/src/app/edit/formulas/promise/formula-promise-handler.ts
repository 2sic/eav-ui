import { FieldValue } from "projects/edit-types";
import { EavContentType } from "../../shared/models/eav";
import { FormulaPromiseResult } from "./formula-promise-result.model";
import { FormulaSettingsHelper } from "../results/formula-settings.helper";
import { FormulaValueCorrections } from "../results/formula-value-corrections.helper";
import { FormulaTargets, SettingsFormulaPrefix } from '../targets/formula-targets';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { Injectable, Signal } from "@angular/core";
import { FormulaResultRaw } from "../results/formula-results.models";
import { FieldSettingPair } from './formula-promise-result.model';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { ItemService } from '../../shared/store/item.service';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldProps } from '../../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FieldsPropsEngine } from '../../state/fields-properties-engine';
import { FieldsValuesModifiedHelper } from '../../state/fields-values-modified.helper';
import { FieldsPropsEngineCycle } from '../../state/fields-properties-engine-cycle';

const logThis = false;
const nameOfThis = 'FormulaPromiseHandler';

/**
 * FormulaPromiseHandler is responsible for handling the promise parts of formula results.
 */
@Injectable()
export class FormulaPromiseHandler {
  #fieldsSettingsService: FieldsSettingsService = null;

  private entityGuid: string;
  private contentType: Signal<EavContentType>;
  private modifiedChecker: FieldsValuesModifiedHelper;

  private log = new EavLogger(nameOfThis, logThis);

  private updateValueQueue: Record<string, FormulaPromiseResult> = {};
  
  constructor(private itemService: ItemService) { }

  init(entityGuid: string,
    contentType: Signal<EavContentType>,
    fieldsSettingsService: FieldsSettingsService,
    modifiedChecker: FieldsValuesModifiedHelper,
  ) {
    this.entityGuid = entityGuid;
    this.#fieldsSettingsService = fieldsSettingsService;
    this.contentType = contentType;
    this.modifiedChecker = modifiedChecker;
  }

  /**
   * Used for filling queue and triggering next run.
   * @param promiseResult
   * @param formulaCache
   * @param inputTypeName
   */
  handleFormulaPromise(promiseResult: FormulaResultRaw, formulaCache: FormulaCacheItem, inputTypeName: InputTypeStrict): void {
    this.log.fn('handleFormulaPromise', { promiseResult, formulaCache, inputTypeName });
    if (promiseResult.openInDesigner && promiseResult.stop === null)
      console.log(`FYI: formula returned a promise. This automatically stops this formula from running again. If you want it to continue running, return stop: false`);
    formulaCache.promises$.next(promiseResult.promise);
    this.defineCallbackHandlerIfMissing(formulaCache, inputTypeName);
  }

  /**
   * Used for defining the callback handler for the promise if it doesn't already exist and filling queue for the next run.
   * @param formulaCache
   * @param inputTypeName
   * @param entityGuid
   */
  private defineCallbackHandlerIfMissing(
    formulaCache: FormulaCacheItem,
    inputTypeName: InputTypeStrict,
  ) {
    const entityGuid = this.entityGuid;
    const l = this.log.fn('DefineCallbackHandlerIfMissing', { formulaCache, inputTypeName, entityGuid });
    if (formulaCache.updateCallback$.value)
      return;

    const queue = this.updateValueQueue;
    formulaCache.updateCallback$.next((result: FieldValue | FormulaResultRaw) => {
      const corrected = FormulaValueCorrections.correctAllValues(formulaCache.target, result, inputTypeName);

      const queueItem = queue[entityGuid] ?? new FormulaPromiseResult({}, [], []);
      let valueUpdates: ItemValuesOfLanguage = {};
      let settingUpdate: FieldSettingPair[] = [];

      if (formulaCache.target === FormulaTargets.Value) {
        valueUpdates = queueItem.valueUpdates ?? {};
        valueUpdates[formulaCache.fieldName] = corrected.value;
      } else if (formulaCache.target.startsWith(SettingsFormulaPrefix)) {
        l.a("formula promise settings");
        const settingName = formulaCache.target.substring(SettingsFormulaPrefix.length);
        settingUpdate = queueItem.settingUpdates ?? [];
        const newSetting = { name: formulaCache.fieldName, settings: [{ settingName, value: result as FieldValue }] };
        settingUpdate = settingUpdate.filter(s => s.name !== formulaCache.fieldName && !s.settings.find(ss => ss.settingName === settingName));
        settingUpdate.push(newSetting);
      }

      const fieldsUpdates = queueItem.fieldUpdates ?? [];
      if (corrected.fields)
        fieldsUpdates.push(...corrected.fields);
      queue[entityGuid] = new FormulaPromiseResult(valueUpdates, fieldsUpdates, settingUpdate);
      formulaCache.stopFormula = corrected.stop ?? formulaCache.stopFormula;
      this.#fieldsSettingsService.retriggerFormulas('promise');
    });
  }

  /**
   * Used for updating values and cleaning settings from queue.
   * @param formValues
   * @param fieldsProps
   * @param slotIsEmpty
   * @param attributes
   * @param constantFieldParts
   * @param itemAttributes
   * @param formReadOnly
   * @param logicTools
   * @param formItemFormulaService
   * @returns true if values were updated, false otherwise and new field props
   */
  changesFromQueue(cycle: FieldsPropsEngineCycle): QueuedChanges {
    // Get data from change queue and then flush, as we'll process it next and in case of errors we don't want to reprocess it
    const toProcess = this.updateValueQueue[this.entityGuid];
    this.updateValueQueue[this.entityGuid] = null;

    // If nothing in the queue for this entity, exit early
    if (toProcess == null)
      return { valueChanges: {}, newFieldProps: null };

    // Updates to process/import
    const values = toProcess.valueUpdates;
    const fields = toProcess.fieldUpdates;
    const settings = toProcess.settingUpdates;

    // Handle values (of this field) and fields (values of other fields)
    const modifiedValues = (Object.keys(values).length !== 0 || fields.length !== 0)
      ? this.modifiedChecker.getValueUpdates(cycle, fields, values)
      : {};

    // Handle settings
    const contentType = this.contentType();
    let newFieldProps: Record<string, FieldProps> = null;
    if (settings.length) {
      newFieldProps = { ...cycle.fieldProps };
      const itemAttributes = this.itemService.getItemAttributes(this.entityGuid);
      settings.forEach(valueSet => {
        const settingsCurrent = cycle.fieldProps[valueSet.name]?.settings;
        
        let settingsNew: Record<string, any> = {};
        valueSet.settings.forEach(setting => {
          const target = SettingsFormulaPrefix + setting.settingName;
          ({ settingsNew } = FormulaSettingsHelper.keepSettingIfTypeOk(target, settingsCurrent, setting.value, settingsNew));
        });

        const constantFieldPart = cycle.getFieldConstants(valueSet.name);
        const attribute = contentType.Attributes.find(a => a.Name === valueSet.name);

        // Prepare helper which the formula will need to verify if the field is visible
        const setUpdHelper = cycle.updateHelper.create(attribute, constantFieldPart, itemAttributes[attribute.Name]);

        const mergedSettings = { ...settingsCurrent, ...settingsNew };
        const updatedSettings = setUpdHelper.correctSettingsAfterChanges(mergedSettings, cycle.values[valueSet.name]);

        newFieldProps[valueSet.name] = { ...newFieldProps[valueSet.name], settings: updatedSettings };
      });
    }

    return { valueChanges: modifiedValues, newFieldProps };
  }
}

interface QueuedChanges {
  /** value changes, may not be null */
  valueChanges: ItemValuesOfLanguage,
  newFieldProps: Record<string, FieldProps>
}