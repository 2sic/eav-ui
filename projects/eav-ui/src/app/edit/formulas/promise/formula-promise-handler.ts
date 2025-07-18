import { Injectable, Signal } from "@angular/core";
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../../shared/logging';
import { DebugFields } from '../../edit-debug';
import { EavContentType } from "../../shared/models/eav";
import { FieldProps } from '../../state/fields-configs.model';
import { FieldsPropsEngineCycle } from '../../state/fields-properties-engine-cycle';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsValuesModifiedHelper } from '../../state/fields-values-modified.helper';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { ItemService } from '../../state/item.service';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { FieldFormulasResultRaw, FieldValueOrResultRaw } from "../results/formula-results.models";
import { FormulaSettingsHelper } from "../results/formula-settings.helper";
import { FormulaValueCorrections } from "../results/formula-value-corrections.helper";
import { SettingsFormulaPrefix } from '../targets/formula-targets';
import { FormulaPromiseResult } from "./formula-promise-result.model";

const logSpecs = {
  all: false,
  addFormulaPromise: true,
  updateStop: false,
  defineCallbackHandlerIfMissing: false,
  changesFromQueue: false,
  promiseComplete: true,
  filterFormulas: true,
  fields: [...DebugFields], // or '*' for all
};

/**
 * FormulaPromiseHandler is responsible for handling the promise parts of formula results.
 * 
 * It is responsible for a single entity.
 */
@Injectable()
export class FormulaPromiseHandler {

  log = classLog({FormulaPromiseHandler}, logSpecs);

  // #contentTypeSvc = inject(ContentTypeService);

  constructor(private itemSvc: ItemService) { }

  #updateValueQueue: Record<string, FormulaPromiseResult> = {};
  
  init(entityGuid: string,
    contentType: Signal<EavContentType>,
    fieldsSettingsService: FieldsSettingsService,
    modifiedChecker: FieldsValuesModifiedHelper,
  ) {
    this.#entityGuid = entityGuid;
    this.#fieldsSettingsService = fieldsSettingsService;
    this.#contentType = contentType;
    this.#modifiedChecker = modifiedChecker;
  }

  #fieldsSettingsService: FieldsSettingsService = null;
  #entityGuid: string;
  #contentType: Signal<EavContentType>;
  #modifiedChecker: FieldsValuesModifiedHelper;

  public updateStop(formula: FormulaCacheItem, raw: FieldFormulasResultRaw): void {
    const l = this.log.fnIfInList('updateStop', 'fields', formula.fieldName, { promiseResult: raw, formula }, formula.target);

    const hasPromise = raw.promise instanceof Promise;

    // Stop depends on explicit result and the default is different if it has a promise
    // TODO: CONTINUE HERE - probably stop being set aggressively even if sleeping...
    // Sleep state not fully resolved...
    const newStop = raw.stop ?? (hasPromise ? true : formula.stop); 
    const msg = `🧪⏹️ formula.stop: ${formula.stop}; raw.stop: ${raw.stop}; hasPromise: ${hasPromise}; newStop: ${newStop}`;
    formula.stop = newStop;
    return l.end(msg);
  }

  /**
   * Used for filling queue and triggering next run.
   * @param raw
   * @param formula
   * @param inputTypeName
   */
  public handleStopAndPromise(formula: FormulaCacheItem, raw: FieldFormulasResultRaw): void {
    const l = this.log.fnIfInList('addFormulaPromise', 'fields', formula.fieldName, { promiseResult: raw, formula }, formula.target);

    // If no promise, exit early
    if (!(raw.promise instanceof Promise))
      return l.end('no promise');
    
    // If the user is currently editing this formula,
    // give him additional info about stopping.
    if (raw.openInDesigner && raw.stop === null)
      console.log(`FYI: formula returned a promise. This automatically stops this formula from running again. If you want it to continue running, return stop: false`);
    
    // Check sleep state (new feat in v18 for Pickers (state/data))
    // Unclear if this should be here in the promise handling...
    const sleep = raw.sleep ?? false;
    
    // If result _contains_ a promise, add it to the queue
    // Add promise to the queue / ensure callback handling ???
    formula.promises$.next({ promise: raw.promise, sleep, completed: false });
    this.#defineCallbackHandlerIfMissing(formula);

    return l.end(`promise added, sleep: ${sleep}`);
  }

  /**
   * Filter out formulas which shouldn't run because of promises. Rules are:
   * - not stopped (this is not handled here, as it applies to non-promise formulas too)
   * - has promise, but is sleeping so we don't want to run it until it has completed
   * @param fieldName 
   * @param before 
   * @returns 
   */
  public filterFormulas(fieldName: string, before: FormulaCacheItem[]) {
    const l = this.log.fnIfInList('filterFormulas', 'fields', fieldName, { enabled: before });
    const formulas = before.filter(f => {
      const promise = f.promises$.value;
      l.a(`hasPromise: ${!!promise}; completed: ${promise?.completed}; sleep: ${promise?.sleep}`);
      return !promise || (promise.completed || !promise.sleep);
    });
    const msg = `🧪📊 beforeFilter: ${before.length}; formulas: ${formulas.length}; `;
    return l.rSilent(formulas, msg);
  }


  /**
   * Used for defining the callback handler for the promise if it doesn't already exist and filling queue for the next run.
   * @param formula
   * @param inputType
   * @param entityGuid
   */
  #defineCallbackHandlerIfMissing(formula: FormulaCacheItem): void {
    const entityGuid = this.#entityGuid;
    const lcb = this.log.fnIfInList('defineCallbackHandlerIfMissing', 'fields', formula.fieldName, { formula, entityGuid }, formula.target);
    if (formula.updateCallback$.value)
      return lcb.end('callback already defined');

    formula.updateCallback$.next((result: FieldValueOrResultRaw) => this.#promiseComplete(formula, result));
  }

  #promiseComplete(formula: FormulaCacheItem, result: FieldValueOrResultRaw): void {
    const entityGuid = this.#entityGuid;
    const l = this.log.fnIfInList('promiseComplete', 'fields', formula.fieldName, { result, formula, entityGuid }, formula.target);
    const fieldName = formula.fieldName;
    const raw = new FormulaValueCorrections(this.#contentType(), entityGuid, fieldName, formula.isValue, formula.inputType, false).v2(result);

    // Make sure the cache contains this entry
    const queue = this.#updateValueQueue;
    const queueItem = queue[entityGuid] ??= new FormulaPromiseResult(entityGuid);      
    const fieldQueue = queueItem.data[fieldName] ??= {
      name: fieldName,
      value: formula.isValue ? raw.value : undefined,
      fields: [],
      settings: {}
    };

    if (formula.isSetting) {
      // New v18 settings are added to the field settings
      l.a("formula promise settings");
      fieldQueue.settings ??= {};
      fieldQueue.settings[formula.settingName] = raw.value;
    }

    if (raw.fields) {
      l.a("formula promise fields");
      fieldQueue.fields.push(...raw.fields);
    }

    // new WIP
    formula.stop = raw.stop ?? formula.stop;
    formula.promiseCompleted = true;
    l.end('promise complete, will retriggerFormulas', fieldQueue as unknown as Record<string, unknown>);
    this.#fieldsSettingsService.retriggerFormulas('promise');
  }

  /**
   * Used for updating values and cleaning settings from queue.
   * @returns true if values were updated, false otherwise and new field props
   */
  public changesFromQueue(cycle: FieldsPropsEngineCycle): QueuedChanges {
    // Get data from change queue and then flush, as we'll process it next and in case of errors we don't want to reprocess it
    const toProcess = this.#updateValueQueue[this.#entityGuid];
    this.#updateValueQueue[this.#entityGuid] = null;

    // If nothing in the queue for this entity, exit early
    if (toProcess == null || toProcess.data == null || Object.keys(toProcess.data).length === 0)
      return { valueChanges: {}, newFieldProps: null };

    // Updates to process/import
    const dataEntries = Object.entries(toProcess.data);
    const valuesArray = dataEntries.map(([name, field]) => ({ name, value: field.value }));
    const values = valuesArray.reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {} as ItemValuesOfLanguage);

    const fields = dataEntries
      .filter(([_, field]) => field.fields.length > 0)
      .map(([_, field]) => field.fields)
      .flat();

    const settings = dataEntries
      .filter(([_, field]) => Object.keys(field.settings).length > 0)
      .map(([name, field]) => ({ fieldName: name, settings: field.settings }));

    // Handle values (of this field) and fields (values of other fields)
    const modifiedValues = (Object.keys(values).length !== 0 || fields.length !== 0)
      ? this.#modifiedChecker.getValueUpdates(cycle, fields, values)
      : {};

    // Handle settings
    const contentType = this.#contentType();
    let newFieldProps: Record<string, FieldProps> = null;
    if (settings.length) {
      newFieldProps = { ...cycle.fieldProps };
      const itemAttributes = this.itemSvc.getItemAttributes(this.#entityGuid);
      Object.values(settings).forEach(setting => {
        const fieldName = setting.fieldName;
        const settingsCurrent = cycle.fieldProps[fieldName]?.settings;
        
        let settingsNew: Partial<FieldSettings> = {};
        Object.entries(setting.settings).forEach(([name, value]) => {
          const target = SettingsFormulaPrefix + name;
          settingsNew = FormulaSettingsHelper.keepSettingIfTypeOk(target, settingsCurrent, value, settingsNew);

          const constantFieldPart = cycle.getFieldConstants(fieldName);
          const attribute = contentType.Attributes.find(a => a.Name === fieldName);

          // Prepare helper which the formula will need to verify if the field is visible
          const setUpdHelper = cycle.updateHelper.create(fieldName, attribute, constantFieldPart, itemAttributes[fieldName]);

          const mergedSettings = { ...settingsCurrent, ...settingsNew };
          const updatedSettings = setUpdHelper.correctSettingsAfterChanges(mergedSettings, cycle.values[fieldName]);

          newFieldProps[fieldName] = { ...newFieldProps[fieldName], settings: updatedSettings };
        });

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