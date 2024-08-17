import { FieldValue } from "projects/edit-types";
import { EntityReader } from "../shared/helpers";
import { FormValues, FieldsProps, FieldConstantsOfLanguage } from "../shared/models";
import { EavContentType, EavContentTypeAttribute, EavEntityAttributes } from "../shared/models/eav";
import { FormulaPromiseResult } from "./models/formula-promise-result.model";
import { FormulaSettingsHelper } from "./helpers/formula-settings.helper";
import { FormulaValueCorrections } from "./helpers/formula-value-corrections.helper";
import { FormulaCacheItem, FormulaTargets, SettingsFormulaPrefix } from "./models/formula.models";
import { Injectable } from "@angular/core";
import { FieldsSettingsService } from "../shared/services";
import { FormulaResultRaw, FieldSettingPair } from "./models/formula-results.models";
import { FormItemFormulaService } from "./form-item-formula.service";
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
  private fieldsSettingsService: FieldsSettingsService = null;

  private log = new EavLogger(nameOfThis, logThis);

  constructor() { }

  init(fieldsSettingsService: FieldsSettingsService) {
    this.fieldsSettingsService = fieldsSettingsService;
  }

  /**
   * Used for filling queue and triggering next run.
   * @param entityGuid
   * @param resultWithPromise
   * @param formulaCache
   * @param inputTypeName
   */
  handleFormulaPromise(
    entityGuid: string,
    resultWithPromise: FormulaResultRaw,
    formulaCache: FormulaCacheItem,
    inputTypeName: InputTypeStrict,
  ) {
    this.log.fn('handleFormulaPromise', { entityGuid, resultWithPromise, formulaCache, target: formulaCache.target, inputType: inputTypeName });
    if (resultWithPromise.openInDesigner && resultWithPromise.stop === null) {
      console.log(`FYI: formula returned a promise. This automatically stops this formula from running again. If you want it to continue running, return stop: false`);
    }
    formulaCache.promises$.next(resultWithPromise.promise);
    this.DefineCallbackHandlerIfMissing(formulaCache, inputTypeName, entityGuid);
  }

  /**
   * Used for defining the callback handler for the promise if it doesn't already exist and filling queue for the next run.
   * @param formulaCache
   * @param inputTypeName
   * @param entityGuid
   */
  private DefineCallbackHandlerIfMissing(
    formulaCache: FormulaCacheItem,
    inputTypeName: InputTypeStrict,
    entityGuid: string,
  ) {
    const l = this.log.fn('DefineCallbackHandlerIfMissing', { formulaCache, inputTypeName, entityGuid });
    if (!formulaCache.updateCallback$.value) {
      const queue = this.fieldsSettingsService.updateValueQueue;
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
        this.fieldsSettingsService.retriggerFormulas();
      });
    }
  }

  /**
   * Used for updating values and cleaning settings from queue.
   * @param entityGuid
   * @param queue
   * @param contentType
   * @param formValues
   * @param fieldsProps
   * @param slotIsEmpty
   * @param entityReader
   * @param latestFieldProps
   * @param attributes
   * @param contentTypeMetadata
   * @param constantFieldParts
   * @param itemAttributes
   * @param formReadOnly
   * @param logicTools
   * @param formItemFormulaService
   * @returns true if values were updated, false otherwise and new field props
   */
  updateValuesFromQueue(
    entityGuid: string,
    queue: Record<string, FormulaPromiseResult>,
    contentType: EavContentType,
    formValues: FormValues,
    fieldsProps: FieldsProps,
    slotIsEmpty: boolean,
    entityReader: EntityReader,
    latestFieldProps: FieldsProps,
    attributes: EavContentTypeAttribute[],
    constantFieldParts: FieldConstantsOfLanguage[],
    itemAttributes: EavEntityAttributes,
    formItemFormulaService: FormItemFormulaService,
    setUpdHelperFactory: FieldSettingsUpdateHelperFactory,
  ): { valuesUpdated: boolean, newFieldProps: FieldsProps } {
    // Get data from change queue
    const toProcess = queue[entityGuid];

    // If nothing in the queue for this entity, exit early
    if (toProcess == null)
      return { valuesUpdated: false, newFieldProps: null };

    // Flush queue for this item, as we'll process it next and in case of errors we don't want to reprocess it
    queue[entityGuid] = null;

    // extract updates and flush queue
    const values = toProcess.valueUpdates;
    const fields = toProcess.fieldUpdates;
    const allSettings = toProcess.settingUpdates;

    let valuesUpdated = false;
    if (Object.keys(values).length !== 0 || fields.length !== 0) {
      formItemFormulaService.applyValueChangesFromFormulas(
        entityGuid,
        contentType,
        formValues,
        fieldsProps,
        values,
        fields,
        slotIsEmpty,
        entityReader
      );
      valuesUpdated = true;
    }

    let newFieldProps: FieldsProps = null;
    if (allSettings.length) {
      newFieldProps = { ...fieldsProps };
      allSettings.forEach(valueSet => {
        const settingsCurrent = latestFieldProps[valueSet.name]?.settings;
        
        let settingsNew: Record<string, any> = {};
        valueSet.settings.forEach(setting => {
          ( { settingsNew } = FormulaSettingsHelper.keepSettingIfTypeMatches(
            SettingsFormulaPrefix + setting.settingName,
            settingsCurrent,
            setting.value,
            settingsNew));
        });

        const constantFieldPart = constantFieldParts.find(f => f.fieldName === valueSet.name);
        const attribute = attributes.find(a => a.Name === valueSet.name);

        // Prepare helper which the formula will need to verify if the field is visible
        const setUpdHelper = setUpdHelperFactory.create(
          attribute,
          constantFieldPart,
          itemAttributes[attribute.Name],
        );

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
