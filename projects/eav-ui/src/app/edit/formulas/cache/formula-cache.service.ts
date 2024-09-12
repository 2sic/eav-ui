import { Injectable, untracked } from '@angular/core';
import { FieldValue } from '../../../../../../edit-types';
import { FormulaDefaultTargetValues, FormulaNewPickerTargetValues, FormulaOptionalTargetValues, FormulaTarget } from '../targets/formula-targets';
import { FormulaCacheItem } from './formula-cache.model';
import { FormulaIdentifier } from '../results/formula-results.models';
import { FormulaResultCacheItem } from './formula-cache.model';
import { signalObj } from '../../../shared/signals/signal.utilities';
import { FormulaCacheBuilder } from './formula-cache.builder';
import { transient } from '../../../core';
import { classLog } from '../../../shared/logging';
import { logSpecsFormulaFields } from '../formula-engine';

const logSpecs = {
  all: true,
  getActive: true,
  fields: ['*'], // will be replaced by shared list below
};

/**
 * Service just to cache formulas for execution and use in the designer.
 */
@Injectable()
export class FormulaCacheService {

  log = classLog({FormulaCacheService}, { ...logSpecs, fields: logSpecsFormulaFields }, false);

  constructor() { }

  /** All the formulas with various additional info to enable execution and editing */
  public formulas = signalObj<FormulaCacheItem[]>('formulas', []);

  /** All the formula results */
  #results = signalObj<FormulaResultCacheItem[]>('formula-results', []);

  #cacheBuilder = transient(FormulaCacheBuilder);

  init() {
    const formulaCache = this.#cacheBuilder.buildFormulaCache(this);
    this.formulas.set(formulaCache);
  }

  //#region Formulas Get / Find

  /**
   * Used for returning formulas filtered by optional entity, field or target.
   * @param entityGuid Optional entity guid
   * @param fieldName Optional field
   * @param target Optional target
   * @param allowDraft
   * @returns Filtered formula array
   */
  #findFormulas(entityGuid?: string, fieldName?: string, target?: FormulaTarget[], allowDraft?: boolean): FormulaCacheItem[] {
    return this.formulas().filter(f =>
        (entityGuid ? f.entityGuid === entityGuid : true)
        && (fieldName ? f.fieldName === fieldName : true)
        && (target ? target?.find(target => f.target == target) : true)
        && (allowDraft ? true : !f.isDraft)
    );
  }

  /**
   * Find formulas of the current field which are still running.
   * Uses the designerService as that can modify the behavior while developing a formula.
   */
  public getActive(entityGuid: string, name: string, forNewPicker: boolean, versionHasChanged: boolean): FormulaCacheItem[] {
    const l = this.log.fnIfInList('getActive', 'fields', name, () => ({ name, forNewPicker, versionHasChanged, formulas: this.formulas() }));
    const targets = FormulaDefaultTargetValues
      .concat(forNewPicker ? FormulaNewPickerTargetValues : FormulaOptionalTargetValues);
    
    const all = this.#findFormulas(entityGuid, name, targets, false);

    const unstopped = all.filter(f => !f.stopFormula);

    const unPaused = unstopped.filter(f => !f.pauseFormula || versionHasChanged);

    return l.r(unPaused, `all: ${all.length}, unstopped: ${unstopped.length}, unpaused: ${unPaused.length}`);
  }



  public formulaListIndexAndOriginal(fOrDs: FormulaIdentifier) {
    const list = this.formulas();
    const index = list.findIndex(f => f.entityGuid === fOrDs.entityGuid && f.fieldName === fOrDs.fieldName && f.target === fOrDs.target);
    const value = list[index];
    return { list, index, value };
  }

  //#endregion

  //#region Formulas CRUD

  /**
   * Used for saving updated formula from editor.
   */
  public updateSaved(formulaItem: FormulaCacheItem, sourceGuid: string, sourceId: number): void {
    const { list, index, value } = this.formulaListIndexAndOriginal(formulaItem);
    if (value == null)
      return;

    const updated: FormulaCacheItem = {
      ...value,
      sourceCodeSaved: formulaItem.sourceCode,
      sourceCodeGuid: sourceGuid,
      sourceCodeId: sourceId,
    };

    const newCache = [...list.slice(0, index), updated, ...list.slice(index + 1)];
    this.formulas.set(newCache);
  }

  /**
   * Used for updating formula from editor.
   */
  public updateFormulaFromEditor(id: FormulaIdentifier, formula: string, run: boolean): void {
    const newCache = this.#cacheBuilder.updateFormulaFromEditor(this, id, formula, run);
    this.formulas.set(newCache);
  }

  /**
   * Used for deleting formula.
   */
  public delete(id: FormulaIdentifier): void {
    const { list, index } = this.formulaListIndexAndOriginal(id);
    if (index < 0) return;
    const newCache = [...list.slice(0, index), ...list.slice(index + 1)];
    this.formulas.set(newCache);
  }

  /**
   * Used for resetting formula.
   */
  public resetFormula(id: FormulaIdentifier): void {
    this.#deleteResult(id);

    // If we reset to saved code, then do that, otherwise delete/flush
    const sourceCodeSaved = this.formulaListIndexAndOriginal(id).value?.sourceCodeSaved;
    if (sourceCodeSaved != null)
      this.updateFormulaFromEditor(id, sourceCodeSaved, true);
    else 
      this.delete(id);
  }

  //#endregion

  //#region Get Results & Delete

  /**
   * Cache the results of a formula - mainly for showing formula result in editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param value
   * @param isError
   * @param isOnlyPromise
   */
  public cacheResults(formulaItem: FormulaIdentifier, value: FieldValue, isError: boolean, isOnlyPromise: boolean): void {
    const newResult: FormulaResultCacheItem = {
      entityGuid: formulaItem.entityGuid,
      fieldName: formulaItem.fieldName,
      target: formulaItem.target,
      value,
      isError,
      isOnlyPromise,
    };
    const l = this.log.fn('cacheResults', { newResult });

    // We should not track reading the list during formula execution
    // since we don't depend on it!
    untracked(() => {
      const { list, index } = this.resultListIndexAndOriginal(formulaItem);
      const newResults = index >= 0
        ? [...list.slice(0, index), newResult, ...list.slice(index + 1)]
        : [newResult, ...list];

      // side effect within props calculations
        l.a('set results', { list, index, newResults});
        this.#results.set(newResults);
    });
    l.end('ok');
  }

  public resultListIndexAndOriginal(id: FormulaIdentifier) {
    const list = this.#results();
    const index = list.findIndex(r => r.entityGuid === id.entityGuid && r.fieldName === id.fieldName && r.target === id.target);
    const value = list[index];
    return { list, index, value };
  }

  /**
   * Delete Results from cache.
   */
  #deleteResult(id: FormulaIdentifier): void {
    const { list, index } = this.resultListIndexAndOriginal(id);
    if (index < 0) return;
    const newResults = [...list.slice(0, index), ...list.slice(index + 1)];
    this.#results.set(newResults);
  }  

  //#endregion
}
