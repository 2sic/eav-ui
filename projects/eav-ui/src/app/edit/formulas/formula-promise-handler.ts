import { FieldValue } from "projects/edit-types";
import { ItemValuesOfOneLanguage, FieldsProps, FieldConstantsOfLanguage } from "../shared/models";
import { EavContentType } from "../shared/models/eav";
import { FormulaPromiseResult } from "./models/formula-promise-result.model";
import { FormulaSettingsHelper } from "./helpers/formula-settings.helper";
import { FormulaValueCorrections } from "./helpers/formula-value-corrections.helper";
import { FormulaCacheItem, FormulaTargets, SettingsFormulaPrefix } from "./models/formula.models";
import { Injectable, Signal } from "@angular/core";
import { FormulaResultRaw, FieldSettingPair } from "./models/formula-results.models";
import { ItemFormulaBroadcastService } from "./form-item-formula.service";
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldSettingsUpdateHelperFactory } from '../services/state/fields-settings-update.helpers';
import { InputTypeStrict } from '../../content-type-fields/constants/input-type.constants';
import { ItemService } from '../shared/store/ngrx-data/item.service';
import { FieldsSettingsService } from '../services/state/fields-settings.service';

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
  
  constructor(private itemService: ItemService) { }

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
    if (!formulaCache.updateCallback$.value) {
      const queue = this.updateValueQueue;
      formulaCache.updateCallback$.next((result: FieldValue | FormulaResultRaw) => {
        const corrected = FormulaValueCorrections.correctAllValues(formulaCache.target, result, inputTypeName);

        const queueItem = queue[entityGuid] ?? new FormulaPromiseResult({}, [], []);
        let valueUpdates: ItemValuesOfOneLanguage = {};
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
  updateFromQueue(
    formValues: ItemValuesOfOneLanguage,
    fieldsProps: FieldsProps,
    constantFieldParts: FieldConstantsOfLanguage[],
    setUpdHelperFactory: FieldSettingsUpdateHelperFactory,
  ): { hadValueChanges: boolean, newFieldProps: FieldsProps } {
    // Get data from change queue
    const toProcess = this.updateValueQueue[this.entityGuid];

    // If nothing in the queue for this entity, exit early
    if (toProcess == null)
      return { hadValueChanges: false, newFieldProps: null };

    // Flush queue for this item, as we'll process it next and in case of errors we don't want to reprocess it
    this.updateValueQueue[this.entityGuid] = null;

    // Updates to process/import
    const values = toProcess.valueUpdates;
    const fields = toProcess.fieldUpdates;
    const settings = toProcess.settingUpdates;

    // Handle values (of this field) and fields (values of other fields)
    let hadValueChanges = false;
    if (Object.keys(values).length !== 0 || fields.length !== 0) {
      this.changeBroadcastSvc.applyValueChangesFromFormulas(
        formValues,
        fieldsProps,
        values,
        fields,
      );
      hadValueChanges = true;
    }

    // Handle settings
    const contentType = this.contentType();
    let newFieldProps: FieldsProps = null;
    if (settings.length) {
      newFieldProps = { ...fieldsProps };
      const itemAttributes = this.itemService.getItemAttributes(this.entityGuid);
      settings.forEach(valueSet => {
        const settingsCurrent = fieldsProps[valueSet.name]?.settings;
        
        let settingsNew: Record<string, any> = {};
        valueSet.settings.forEach(setting => {
          const target = SettingsFormulaPrefix + setting.settingName;
          ({ settingsNew } = FormulaSettingsHelper.keepSettingIfTypeOk(target, settingsCurrent, setting.value, settingsNew));
        });

        const constantFieldPart = constantFieldParts.find(f => f.fieldName === valueSet.name);
        const attribute = contentType.Attributes.find(a => a.Name === valueSet.name);

        // Prepare helper which the formula will need to verify if the field is visible
        const setUpdHelper = setUpdHelperFactory.create(attribute, constantFieldPart, itemAttributes[attribute.Name]);

        const updatedSettings = setUpdHelper.correctSettingsAfterChanges(
          {
            ...settingsCurrent,
            ...settingsNew,
          },
          formValues[valueSet.name],
        );

        newFieldProps[valueSet.name] = { ...newFieldProps[valueSet.name], settings: updatedSettings };
      });
    }

    return { hadValueChanges, newFieldProps };
  }
}
