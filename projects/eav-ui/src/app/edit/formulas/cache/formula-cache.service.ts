import { Injectable, untracked } from '@angular/core';
import { FieldValue } from '../../../../../../edit-types';
import { FormulaTarget } from '../targets/formula-targets';
import { FormulaCacheItem } from './formula-cache.model';
import { FormulaIdentifier } from '../results/formula-results.models';
import { FormulaResultCacheItem } from './formula-cache.model';
import { signalObj } from '../../../shared/signals/signal.utilities';
import { FormulaCacheBuilder } from './formula-cache.builder';
import { transient } from '../../../core';
import { classLog } from '../../../shared/logging';

/**
 * Service just to cache formulas for execution and use in the designer.
 */
@Injectable()
export class FormulaCacheService {

  log = classLog({FormulaCacheService}, null, false);

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

  /**
   * Used for returning formulas filtered by optional entity, field or target.
   * @param entityGuid Optional entity guid
   * @param fieldName Optional field
   * @param target Optional target
   * @param allowDraft
   * @returns Filtered formula array
   */
  public getFormulas(entityGuid?: string, fieldName?: string, target?: FormulaTarget[], allowDraft?: boolean): FormulaCacheItem[] {
    return this.formulas().filter(f =>
        (entityGuid ? f.entityGuid === entityGuid : true)
        && (fieldName ? f.fieldName === fieldName : true)
        && (target ? target?.find(target => f.target == target) : true)
        && (allowDraft ? true : !f.isDraft)
    );
  }

  /**
   * Used for saving updated formula from editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param formula
   * @param sourceGuid
   * @param sourceId
   * @returns
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

  public formulaListIndexAndOriginal(fOrDs: FormulaIdentifier) {
    const list = this.formulas();
    const index = list.findIndex(f => f.entityGuid === fOrDs.entityGuid && f.fieldName === fOrDs.fieldName && f.target === fOrDs.target);
    const value = list[index];
    return { list, index, value };
  }

  /**
   * Used for deleting formula.
   * @param entityGuid
   * @param fieldName
   * @param target
   */
  public delete(formulaItem: FormulaCacheItem): void {
    const { list, index } = this.formulaListIndexAndOriginal(formulaItem);
    const newCache = [...list.slice(0, index), ...list.slice(index + 1)];
    this.formulas.set(newCache);
  }

  /**
   * Used for resetting formula.
   * @param entityGuid
   * @param fieldName
   * @param target
   */
  public resetFormula(id: FormulaIdentifier): void {
    const { list: resList, index: resIndex } = this.resultListIndexAndOriginal(id);
    if (resIndex >= 0) {
      const newResults = [...resList.slice(0, resIndex), ...resList.slice(resIndex + 1)];
      this.#results.set(newResults);
    }

    const { list, index, value: formValue } = this.formulaListIndexAndOriginal(id);
    if (formValue?.sourceCodeSaved != null) {
      this.updateFormulaFromEditor(id, formValue.sourceCodeSaved, true);
    } else if (index >= 0) {
      const newCache = [...list.slice(0, index), ...list.slice(index + 1)];
      this.formulas.set(newCache);
    }
  }

  /**
   * Used for updating formula from editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param formula
   * @param run
   */
  public updateFormulaFromEditor(id: FormulaIdentifier, formula: string, run: boolean): void {
    const newCache = this.#cacheBuilder.updateFormulaFromEditor(this, id, formula, run);
    this.formulas.set(newCache);
  }

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
}
