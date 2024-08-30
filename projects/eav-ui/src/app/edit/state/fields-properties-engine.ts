import { FieldConstantsOfLanguage, FieldProps } from './fields-configs.model';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { EntityReader } from '../shared/helpers';
import { FormLanguage } from './form-languages.model';
import { FieldSettingsUpdateHelperFactory } from './fields-settings-update.helpers';
import { WrapperHelper } from '../fields/wrappers/wrapper.helper';
import { FormulaPromiseHandler } from '../formulas/formula-promise-handler';
import { ItemFormulaBroadcastService } from '../formulas/form-item-formula.service';
import { FormulaEngine } from '../formulas/formula-engine';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';

/**
 * Assistant helper to process / recalculate the value of fields and their settings.
 * 
 * It should function as follows:
 * 1. The system initialized or something changed - the language, a value, a setting, etc.
 * 2. This triggers a recalculation of the fields and their settings.
 * 3. That kind of change can again re-trigger certain value updates, fields, settings - so it loops...
 * 4. ...until nothing changes - or a max-value has been achieved and it should stop to prevent infinite loops.
 * 5. This is then handed back to the ui / value services for propagation
 * 6. ...after this it should not run again until something changes anew...
 * 
 * Note that as of now, this engine should be created and discarded on every cycle.
 */
export class FieldsPropsEngine {
  constructor(
    public item: EavItem,
    public itemAttributes: EavEntityAttributes,
    /** The values of the form - initialized here and to be updated until complete */
    initialValues: ItemValuesOfLanguage,
    /** The field props at start and during the calculation cycles (may be updated until complete) */
    public fieldProps: Record<string, FieldProps>,
    public fieldConstants: FieldConstantsOfLanguage[],
    readerWithLanguage: EntityReader,
    public updateHelper: FieldSettingsUpdateHelperFactory,
    private changeBroadcastSvc: ItemFormulaBroadcastService,
    private formulaEngine: FormulaEngine,
    private formulaPromises: FormulaPromiseHandler,
  ) {
    this.languages = readerWithLanguage;
    this.#values = initialValues;
  }

  /**
   * The languages used in the form, for ???
   */
  languages: FormLanguage;

  /**
   * Get the current values of the fields, as they may update during the cycle
   */
  get values() { return this.#values; }
  #values: ItemValuesOfLanguage;

  public getLatestSettingsAndBroadcastUpdates(): CycleResults {
    const formValues = this.values;
    // 2. Process the queue of changes from promises if necessary
    // If things change, we will exit because then the observable will be retriggered
    const isFirstRound = Object.keys(this.fieldProps).length === 0;
    if (!isFirstRound) {
      const { newFieldProps, hadValueChanges } = this.formulaPromises.updateFromQueue(this);

      // If we only updated values from promise (queue), don't trigger property regular updates
      if (newFieldProps)
        this.fieldProps = newFieldProps;
      
      // If any value changes then the entire cycle will automatically retrigger.
      // So we exit now as the whole cycle will re-init and repeat.
      if (hadValueChanges)
        return { props: this.fieldProps, broadcastProps: false };
    }

    // 3. Run formulas for all fields - as a side effect (not nice) will also get / init all field settings
    const { fieldsProps, valueUpdates, fieldUpdates } = this.formulaEngine.runFormulasForAllFields(this);

    // 4. On first cycle, also make sure we have the wrappers specified as it's needed by the field creator; otherwise preserve previous
    for (const [key, value] of Object.entries(fieldsProps))
      value.buildWrappers = isFirstRound
        ? WrapperHelper.getWrappers(value.settings, value.constants.inputTypeSpecs)
        : this.fieldProps[key]?.buildWrappers;

    // 5. Update the latest field properties for further cycles
    this.fieldProps = fieldsProps;

    // 6.1 If we have value changes were applied
    const changesWereApplied = this.changeBroadcastSvc.applyValueChangesFromFormulas(
      formValues,
      fieldsProps,
      valueUpdates,
      fieldUpdates,
    );

    // 6.2 If changes had been made before, do not trigger field property updates yet, but wait for the next cycle
    if (changesWereApplied)
      return { props: this.fieldProps, broadcastProps: false };

    // 6.3 If no more changes were applied, then trigger field property updates and reset the loop counter
    this.changeBroadcastSvc.valueFormulaCounter = 0;
    return { props: fieldsProps, broadcastProps: true };
  }


  /**
   * Get latest/current valid field settings - if possible from cache
   * if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
   */
  getFieldSettingsInCycle(constFieldPart: FieldConstantsOfLanguage): FieldSettings {
    const latest = this.fieldProps[constFieldPart.fieldName];
    // if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
    const cachedStillValid = constFieldPart.language == latest?.language;
    const latestSettings: FieldSettings = cachedStillValid
      ? latest?.settings ?? { ...constFieldPart.settingsInitial }
      : { ...constFieldPart.settingsInitial };
    return latestSettings;
  }
}

interface CycleResults {
  props: Record<string, FieldProps>;
  broadcastProps: boolean;
}