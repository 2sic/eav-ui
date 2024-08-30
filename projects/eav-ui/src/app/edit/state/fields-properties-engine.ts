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
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldsValuesModifiedHelper } from './fields-values-modified.helper';
import isEqual from 'lodash-es/isEqual';

const logThis = true;
const nameOfThis = 'FieldsPropsEngine';

const maxChangeCycles = 5;

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
  private log = new EavLogger(nameOfThis, logThis);

  constructor(
    public item: EavItem,
    public itemAttributes: EavEntityAttributes,
    /** The values of the form - initialized here and to be updated until complete */
    private readonly initialValues: ItemValuesOfLanguage,
    /** The field props at start and during the calculation cycles (may be updated until complete) */
    public fieldProps: Record<string, FieldProps>,
    public fieldConstants: FieldConstantsOfLanguage[],
    readerWithLanguage: EntityReader,
    public updateHelper: FieldSettingsUpdateHelperFactory,
    private modifiedChecker: FieldsValuesModifiedHelper,
    private formulaEngine: FormulaEngine,
    private formulaPromises: FormulaPromiseHandler,
  ) {
    this.languages = readerWithLanguage;
    this.values = { ...initialValues };
  }

  /**
   * The languages used in the form, for ???
   */
  languages: FormLanguage;

  /**
   * Get the current values of the fields, as they may update during the cycle
   */
  values: ItemValuesOfLanguage;

  public getLatestSettingsAndValues(): PropsUpdate {
    const l = this.log.fn('getLatestSettingsAndValues');

    for (let i = 0; i < maxChangeCycles; i++) {
      const cycle = this.#getLatestSettingsAndValues(i);
      const mergedValues = { ...this.values, ...cycle.valueChanges };

      // Quit if we have no more changes
      if (isEqual(this.fieldProps, cycle.props) && isEqual(this.values, mergedValues)) {
        l.a('No more changes, stable, exit');
        break;
      }

      // Update state for next cycles
      this.fieldProps = cycle.props;
      this.values = mergedValues;
    }

    // figure out the final changes to propagate
    const finalChanges = this.modifiedChecker.getValueUpdates(this, [], this.values, this.initialValues);

    return { valueChanges: finalChanges, props: this.fieldProps };
  }

  #getLatestSettingsAndValues(loopIndex: number): PropsUpdate {
    const l = this.log.fn('getLatestSettingsAndBroadcastUpdates', { loopIndex });

    // 1. Detect first round as it has slightly different behavior
    const isFirstRound = Object.keys(this.fieldProps).length === 0;

    // 2. Process the queue of changes from promises if necessary
    // If things change, we will exit because then the observable will be retriggered
    if (!isFirstRound) {
      const { valueChanges, newFieldProps } = this.formulaPromises.changesFromQueue(this);

      // If we only updated values from promise (queue), don't trigger property regular updates
      if (newFieldProps) {
        l.a('New field props from queue', { newFieldProps });
        this.fieldProps = newFieldProps;
      }
      
      // If any value changes then the entire cycle will automatically retrigger.
      // So we exit now as the whole cycle will re-init and repeat.
      if (Object.keys(valueChanges).length > 0) {
        l.a('Value changes from queue', { valueChanges });
        this.values = { ...this.values, ...valueChanges };
      }
    } else
      l.a('First round, no queue to process');

    // 3. Run formulas for all fields - as a side effect (not nice) will also get / init all field settings
    const { fieldsProps, valueUpdates, fieldUpdates } = this.formulaEngine.runFormulasForAllFields(this);

    // 4. On first cycle, also make sure we have the wrappers specified as it's needed by the field creator; otherwise preserve previous
    for (const [key, value] of Object.entries(fieldsProps))
      value.buildWrappers = isFirstRound
        ? WrapperHelper.getWrappers(value.settings, value.constants.inputTypeSpecs)
        : this.fieldProps[key]?.buildWrappers;

    // // 5. Update the latest field properties for further cycles
    // this.fieldProps = fieldsProps;

    // 6.1 If we have value changes were applied
    const modifiedValues = this.modifiedChecker.getValueUpdates(this, fieldUpdates, valueUpdates);
    // const hasValueChanges = Object.keys(modifiedValues).length == 0
    //   ? false
    //   : true;

    // // 6.2 If changes had been made before, do not trigger field property updates yet, but wait for the next cycle
    // if (hasValueChanges)
    //   return { valueChanges: modifiedValues, props: this.fieldProps };

    // // 6.3 If no more changes were applied, then trigger field property updates and reset the loop counter
    // this.changeBroadcastSvc.valueFormulaCounter = 0;
    return { valueChanges: modifiedValues, props: fieldsProps };
  }


  /**
   * Get latest/current valid field settings - if possible from cache
   * if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
   */
  getFieldSettingsInCycle(constFieldPart: FieldConstantsOfLanguage): FieldSettings {
    const latest = this.fieldProps[constFieldPart.fieldName];
    // if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
    const cachedStillValid = constFieldPart.language == latest?.language;
    const result: FieldSettings = cachedStillValid
      ? latest?.settings ?? { ...constFieldPart.settingsInitial }
      : { ...constFieldPart.settingsInitial };
    return result;
  }
}

interface PropsUpdate {
  valueChanges: ItemValuesOfLanguage;
  props: Record<string, FieldProps>;
}