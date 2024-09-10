import { untracked } from '@angular/core';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaPropsV1 } from './formula.helpers';
import { FieldValue } from 'projects/edit-types';
import { TranslateService } from '@ngx-translate/core';
import { LoggingService, LogSeverities } from '../shared/services/logging.service';

export class FormulaDeveloperHelper {

  constructor(
    private designerSvc: FormulaDesignerService,
    private translate: TranslateService,
    private logSvc: LoggingService,
    private formula: FormulaCacheItem,
    private ctTitle: string,
    private formulaProps: FormulaPropsV1,
  ) {
    this.isOpen = this.#isDesignerOpen(formula);
  }
  
  /** The designer is currently open, so we should show more information to the developer */
  public isOpen: boolean = false;

  showStart() {
    if (!this.isOpen) return;
    const f = this.formula;
    console.log(`Running formula${f.version?.toLocaleUpperCase()} for Entity: "${this.ctTitle}", Field: "${f.fieldName}", Target: "${f.target}", arguments:`, this.formulaProps);
  }

  showResult(value: FieldValue, isError: boolean, isOnlyPromise: boolean) {
    this.designerSvc.cache.cacheResults(this.formula, value, false, false);
    if (this.isOpen)
      console.log('Formula result:', value);
  }

  showError(error: unknown) {
    const formula = this.formula;
    const errorLabel = `Error in formula calculation for Entity: "${this.ctTitle}", Field: "${formula.fieldName}", Target: "${formula.target}"`;
    this.designerSvc.cache.cacheResults(formula, undefined, true, false);
    this.logSvc.addLog(LogSeverities.Error, errorLabel, error);
    if (this.isOpen)
      console.error(errorLabel, error);
    else
      this.logSvc.showMessage(this.translate.instant('Errors.FormulaCalculation'), 2000);
  }

  /**
   * Used for checking if the currently running formula is open in designer.
   * @param f
   * @returns True if formula is open in designer, otherwise false
   */
  #isDesignerOpen(f: FormulaCacheItem): boolean {
    return untracked(() => {
      const ds = this.designerSvc.designerState();
      const isOpenInDesigner = ds.isOpen && ds.entityGuid === f.entityGuid && ds.fieldName === f.fieldName && ds.target === f.target;
      return isOpenInDesigner;
    });
  }
}