import { FieldConstantsOfLanguage, FieldProps } from './fields-configs.model';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { EntityReader } from '../shared/helpers';
import { FormLanguage } from './form-languages.model';
import { FieldSettingsUpdateHelperFactory } from './fields-settings-update.helpers';
import { FormulaPromiseHandler } from '../formulas/formula-promise-handler';
import { FormulaEngine } from '../formulas/formula-engine';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldsValuesModifiedHelper } from './fields-values-modified.helper';
import { FieldsPropsEngineCycle } from './fields-properties-engine-cycle';

const logThis = true;
const nameOfThis = 'FieldsPropsEngine';

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
    public fieldConstants: FieldConstantsOfLanguage[],
    readerWithLanguage: EntityReader,
    public updateHelper: FieldSettingsUpdateHelperFactory,
    public modifiedChecker: FieldsValuesModifiedHelper,
    public formulaEngine: FormulaEngine,
    public formulaPromises: FormulaPromiseHandler,
  ) {
    this.languages = readerWithLanguage;
  }

  /**
   * The languages used in the form, for ???
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
  public getLatestSettingsAndValues(initialValues: ItemValuesOfLanguage, fieldProps: Record<string, FieldProps>): PropsUpdate {  
    const l = this.log.fn('getLatestSettingsAndValues');
    this.cycle = new FieldsPropsEngineCycle(this, initialValues, fieldProps);
    const cycleResult = this.cycle.getLatestSettingsAndValues();

    // figure out the final changes to propagate
    const finalChanges = this.modifiedChecker.getValueUpdates(this.cycle, [], cycleResult.valueChanges, initialValues);

    return { valueChanges: finalChanges, props: cycleResult.props };
  }

}

interface PropsUpdate {
  valueChanges: ItemValuesOfLanguage;
  props: Record<string, FieldProps>;
}