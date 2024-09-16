import { EavContentType } from "../../shared/models/eav";
import { FormulaPromiseResult } from "./formula-promise-result.model";
import { FormulaSettingsHelper } from "../results/formula-settings.helper";
import { FormulaValueCorrections } from "../results/formula-value-corrections.helper";
import { SettingsFormulaPrefix } from '../targets/formula-targets';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { Injectable, Signal } from "@angular/core";
import { NameValuePair, FieldFormulasResultRaw } from "../results/formula-results.models";
import { FieldSettingPair } from './formula-promise-result.model';
import { ItemService } from '../../state/item.service';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldProps } from '../../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FieldsValuesModifiedHelper } from '../../state/fields-values-modified.helper';
import { FieldsPropsEngineCycle } from '../../state/fields-properties-engine-cycle';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { classLog } from '../../../shared/logging';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';

/**
 * FormulaPromiseHandler is responsible for handling the promise parts of formula results.
 */
@Injectable()
export class FormulaPromiseHandler {
  #fieldsSettingsService: FieldsSettingsService = null;

  private entityGuid: string;
  private contentType: Signal<EavContentType>;
  private modifiedChecker: FieldsValuesModifiedHelper;

  private log = classLog({ FormulaPromiseHandler });

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
   * @param formula
   * @param inputTypeName
   */
  handleFormulaPromise(promiseResult: FieldFormulasResultRaw, formula: FormulaCacheItem): void {
    this.log.fn('handleFormulaPromise', { promiseResult, formula });
    if (promiseResult.openInDesigner && promiseResult.stop === null)
      console.log(`FYI: formula returned a promise. This automatically stops this formula from running again. If you want it to continue running, return stop: false`);
    formula.promises$.next(promiseResult.promise);
    this.defineCallbackHandlerIfMissing(formula);
  }

  /**
   * Used for defining the callback handler for the promise if it doesn't already exist and filling queue for the next run.
   * @param formula
   * @param inputType
   * @param entityGuid
   */
  private defineCallbackHandlerIfMissing(formula: FormulaCacheItem) {
    const entityGuid = this.entityGuid;
    const l = this.log.fn('DefineCallbackHandlerIfMissing', { formula, entityGuid });
    if (formula.updateCallback$.value)
      return;

    const queue = this.updateValueQueue;
    formula.updateCallback$.next((result: FieldValue | FieldFormulasResultRaw) => {
      const raw = new FormulaValueCorrections(formula.fieldName, formula.isValue, formula.inputType, false).v2(result);

      const queueItem = queue[entityGuid] ?? new FormulaPromiseResult({}, [], []);
      let valueUpdates: ItemValuesOfLanguage = {};
      let settingUpdate: FieldSettingPair[] = [];

      if (formula.isValue) {
        valueUpdates = queueItem.valueUpdates ?? {};
        valueUpdates[formula.fieldName] = raw.value;
      } else if (formula.isSetting) {
        l.a("formula promise settings");
        const name = formula.settingName;
        settingUpdate = queueItem.settingUpdates ?? [];
        const newSetting = {
          name: formula.fieldName,
          settings: [{
            name,
            value: result as FieldValue
          } satisfies NameValuePair]
        };
        settingUpdate = settingUpdate.filter(s => s.name !== formula.fieldName && !s.settings.find(ss => ss.name === name));
        settingUpdate.push(newSetting);
      }

      const fieldsUpdates = queueItem.fieldUpdates ?? [];
      if (raw.fields)
        fieldsUpdates.push(...raw.fields);
      queue[entityGuid] = new FormulaPromiseResult(valueUpdates, fieldsUpdates, settingUpdate);
      formula.stop = raw.stop ?? formula.stop;
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
        
        let settingsNew: Partial<FieldSettings> = {};
        valueSet.settings.forEach(setting => {
          const target = SettingsFormulaPrefix + setting.name;
          settingsNew = FormulaSettingsHelper.keepSettingIfTypeOk(target, settingsCurrent, setting.value, settingsNew);
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