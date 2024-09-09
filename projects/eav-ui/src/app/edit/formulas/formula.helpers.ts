
import { FormulaVersions } from './formula-definitions';
import { FormulaDataObject } from './run/formula-run-data';
import { FormulaExecutionSpecsWithRunParams } from './run/formula-objects-internal-data';
import { FormulaContextObject } from './run/formula-run-context';
import { FormulaExperimentalObject } from './run/formula-experimental-object';
import { FormulaV1Data } from './run/formula-run-data.model';
import { FormulaV1Context } from './run/formula-run-context.model';
import { FormulaV1Experimental } from './run/formula-run-experimental.model';
import { PickerItem } from '../fields/picker/models/picker-item.model';

export class FormulaHelpers {
  /**
   * Used to build formula props parameters.
   * @returns Formula properties
   */
  static buildFormulaProps(propsData: FormulaExecutionSpecsWithRunParams,): FormulaPropsV1 {
    const { formula, currentValues: formValues } = propsData.runParameters;
    
    switch (formula.version) {
      case FormulaVersions.V1:
      case FormulaVersions.V2:

        // Create the data object and add all value properties of the form to it
        const data = Object.assign(new FormulaDataObject(propsData), formValues);

        const context = new FormulaContextObject(propsData);

        const experimental = new FormulaExperimentalObject(propsData);

        return {
          data,
          context,
          experimental,
        } satisfies FormulaPropsV1;
      default:
        return;
    }
  }

  /**
   * Used to build the formula props parameters as a record of key-value pairs.
   * @param prefillAsParameters
   * @returns
   */
  static buildFormulaPropsParameters(prefillAsParameters: Record<string, unknown>): Record<string, any> {
    return prefillAsParameters ? JSON.parse(JSON.stringify(prefillAsParameters)) : {};
  }

}



interface FormulaPropsV1 {
  data: FormulaV1Data;
  context: FormulaV1Context;
  experimental: FormulaV1Experimental;
  item?: PickerItem; //@SDV possibly add PickerTreeItem also
}


