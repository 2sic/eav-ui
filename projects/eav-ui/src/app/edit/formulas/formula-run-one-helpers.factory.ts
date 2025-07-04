
import { TranslateService } from '@ngx-translate/core';
import { LoggingService } from '../shared/services/logging.service';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaVersions } from './formula-definitions';
import { FormulaDeveloperHelper } from './formula-developer-helper';
import { FormulaValueCorrections } from './results/formula-value-corrections.helper';
import { FormulaExperimentalObject } from './run/formula-experimental-object';
import { FormulaExecutionSpecsWithRunParams } from './run/formula-objects-internal-data';
import { FormulaContextObject } from './run/formula-run-context';
import { FormulaV1Context } from './run/formula-run-context.model';
import { FormulaDataObject } from './run/formula-run-data';
import { FormulaV1Data } from './run/formula-run-data.model';

/**
 * Helper to run a single formula.
 * Will be initialized for each field as it's about to run all, and can then provide
 * helper objects and build the formula props (data/context/experimental).
 */
export class FormulaRunOneHelpersFactory {

  constructor(
    private designerSvc: FormulaDesignerService,
    private translate: TranslateService,
    private logSvc: LoggingService,
    public ctTitle: string,
  ) { }

  public getPartsFor(execSpecs: FormulaExecutionSpecsWithRunParams) {
    const f = execSpecs.runParameters.formula;
    const params = this.#dataAndCtx(execSpecs);
    const devHelper = new FormulaDeveloperHelper(this.designerSvc, this.translate, this.logSvc, f, this.ctTitle, params);

    return {
      formula: f,
      fieldName: f.fieldName,
      params,
      title: this.ctTitle,
      devHelper,
      valHelper: new FormulaValueCorrections(f.fieldName, f.isValue, f.inputType, devHelper.isOpen, execSpecs.runParameters.pickerHelper.infos.mapper),
    };
  }

  /**
   * Used to build formula props parameters.
   * @returns Formula properties
   */
  #dataAndCtx(runParams: FormulaExecutionSpecsWithRunParams,): FormulaPropsV1 {
    const { formula, currentValues: formValues } = runParams.runParameters;
    
    switch (formula.version) {
      case FormulaVersions.V1:
      case FormulaVersions.V2:

        // Create the data object and add all value properties of the form to it
        const data = Object.assign(new FormulaDataObject(runParams), formValues);

        const experimental = new FormulaExperimentalObject(runParams);

        const context = new FormulaContextObject(runParams, experimental);

        return {
          data,
          context,
          // 2025-04-22 #DropFormulaParamExperimental - remove this comment and warnings ca. 2026-Q2
          // experimental,
        } satisfies FormulaPropsV1;

      default:
        // default should never happen, so don't return any data to use; will probably error if this happens
        throw new Error(`Formula version '${formula.version}' unknown not supported`);
    }
  }
}

/**
 * Used to build the formula props parameters as a record of key-value pairs.
 * @param prefillAsParameters
 * @returns
 */
export class FormulaPropsParameters {
  constructor(private prefill: Record<string, unknown>) { }

  all(): Record<string, any> {
    if (!this.#cache)
      this.#cache = this.prefill ? JSON.parse(JSON.stringify(this.prefill)) : {};
    return this.#cache;
  }
  #cache: Record<string, any>;
}



export interface FormulaPropsV1 {
  data: FormulaV1Data;
  context: FormulaV1Context;
  // 2025-04-22 #DropFormulaParamExperimental - remove this comment and warnings ca. 2026-Q2
  // experimental: FormulaV1Experimental;
}
