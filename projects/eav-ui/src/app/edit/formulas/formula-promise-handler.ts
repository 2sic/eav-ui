import { FieldValue } from "projects/edit-types";
import { EntityReader } from "../shared/helpers";
import { FormValues, FieldsProps, FieldConstantsOfLanguage } from "../shared/models";
import { EavContentType, EavEntityAttributes } from "../shared/models/eav";
import { FormulaPromiseResult } from "./models/formula-promise-result.model";
import { FormulaSettingsHelper } from "./helpers/formula-settings.helper";
import { FormulaValueCorrections } from "./helpers/formula-value-corrections.helper";
import { FormulaCacheItem, FormulaTargets, SettingsFormulaPrefix } from "./models/formula.models";
import { Injectable, Signal } from "@angular/core";
import { FieldsSettingsService } from "../shared/services";
import { FormulaResultRaw, FieldSettingPair } from "./models/formula-results.models";
import { ItemFormulaBroadcastService } from "./form-item-formula.service";
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldSettingsUpdateHelperFactory } from '../shared/helpers/fields-settings-update.helpers';
import { InputTypeStrict } from '../../content-type-fields/constants/input-type.constants';

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
  private changeBroadcastSvc: ItemFormulaBroadcastService;

  private log = new EavLogger(nameOfThis, logThis);

  private updateValueQueue: Record<string, FormulaPromiseResult> = {};

  constructor() { }

  init(entityGuid: string,
    contentType: Signal<EavContentType>,
    fieldsSettingsService: FieldsSettingsService,
    changeBroadcastSvc: ItemFormulaBroadcastService,
  ) {
    this.entityGuid = entityGuid;
    this.#fieldsSettingsService = fieldsSettingsService;
    this.contentType = contentType;
    this.changeBroadcastSvc = changeBroadcastSvc;
  }

  /**
   * Used for filling queue and triggering next run.
   * @param promiseResult
   * @param formulaCache
   * @param inputTypeName
   */
  handleFormulaPromise(promiseResult: FormulaResultRaw, formulaCache: FormulaCacheItem, inputTypeName: InputTypeStrict): void {
    this.log.fn('handleFormulaPromise', { resultWithPromise: promiseResult, formulaCache, inputType: inputTypeName });
    if (promiseResult.openInDesigner && promiseResult.stop === null)
      console.log(`FYI: formula returned a promise. This automatically stops this formula from running again. If you want it to continue running, return stop: false`);
    formulaCache.promises$.next(promiseResult.promise);
    this.defineCallbackHandlerIfMissing(formulaCache, inputTypeName, this.entityGuid);
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
    entityGuid: string,
  ) {
    const l = this.log.fn('DefineCallbackHandlerIfMissing', { formulaCache, inputTypeName, entityGuid });
    if (!formulaCache.updateCallback$.value) {
      const queue = this.updateValueQueue;
      formulaCache.updateCallback$.next((result: FieldValue | FormulaResultRaw) => {
        const corrected = FormulaValueCorrections.correctAllValues(formulaCache.target, result, inputTypeName);

        const queueItem = queue[entityGuid] ?? new FormulaPromiseResult({}, [], []);
        let valueUpdates: FormValues = {};
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
        this.#fieldsSettingsService.retriggerFormulas();
      });
    }
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
  updateValuesFromQueue(
    formValues: FormValues,
    fieldsProps: FieldsProps,
    slotIsEmpty: boolean,
    constantFieldParts: FieldConstantsOfLanguage[],
    itemAttributes: EavEntityAttributes,
    setUpdHelperFactory: FieldSettingsUpdateHelperFactory,
  ): { valuesUpdated: boolean, newFieldProps: FieldsProps } {
    // Get data from change queue
    const toProcess = this.updateValueQueue[this.entityGuid];

    // If nothing in the queue for this entity, exit early
    if (toProcess == null)
      return { valuesUpdated: false, newFieldProps: null };

    // Flush queue for this item, as we'll process it next and in case of errors we don't want to reprocess it
    this.updateValueQueue[this.entityGuid] = null;

    // extract updates and flush queue
    const values = toProcess.valueUpdates;
    const fields = toProcess.fieldUpdates;
    const allSettings = toProcess.settingUpdates;

    let valuesUpdated = false;
    if (Object.keys(values).length !== 0 || fields.length !== 0) {
      this.changeBroadcastSvc.applyValueChangesFromFormulas(
        formValues,
        fieldsProps,
        values,
        fields,
        slotIsEmpty,
      );
      valuesUpdated = true;
    }

    const contentType = this.contentType();
    let newFieldProps: FieldsProps = null;
    if (allSettings.length) {
      newFieldProps = { ...fieldsProps };
      allSettings.forEach(valueSet => {
        const settingsCurrent = fieldsProps[valueSet.name]?.settings;
        
        let settingsNew: Record<string, any> = {};
        valueSet.settings.forEach(setting => {
          ({ settingsNew } = FormulaSettingsHelper.keepSettingIfTypeMatches(
            SettingsFormulaPrefix + setting.settingName,
            settingsCurrent,
            setting.value,
            settingsNew));
        });

        const constantFieldPart = constantFieldParts.find(f => f.fieldName === valueSet.name);
        const attribute = contentType.Attributes.find(a => a.Name === valueSet.name);

        // Prepare helper which the formula will need to verify if the field is visible
        const setUpdHelper = setUpdHelperFactory.create(attribute, constantFieldPart, itemAttributes[attribute.Name]);

        const updatedSettings = setUpdHelper.ensureNewSettingsMatchRequirements(
          {
            ...settingsCurrent,
            ...settingsNew,
          },
          formValues[valueSet.name],
        );

        newFieldProps[valueSet.name] = { ...newFieldProps[valueSet.name], settings: updatedSettings };
      });
    }

    return { valuesUpdated, newFieldProps };
  }
}
