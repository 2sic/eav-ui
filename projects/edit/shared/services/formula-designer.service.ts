import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FieldValue } from '../../../edit-types';
import { CustomFormula, CustomFormulaResult, FormulaType } from '../models';

@Injectable()
export class FormulaDesignerService implements OnDestroy {
  private customFormulas: CustomFormula[] = [];
  private customFormulaResults$ = new BehaviorSubject<CustomFormulaResult[]>([]);

  constructor() { }

  ngOnDestroy(): void {
    this.customFormulaResults$.complete();
  }

  getFormula(entityGuid: string, fieldName: string, type: FormulaType): string {
    return this.customFormulas.find(c => c.entityGuid === entityGuid && c.fieldName === fieldName && c.type === type)?.formula;
  }

  upsertFormula(entityGuid: string, fieldName: string, type: FormulaType, formula: string): void {
    const existing = this.customFormulas.find(c => c.entityGuid === entityGuid && c.fieldName === fieldName && c.type === type);
    if (existing != null) {
      existing.formula = formula;
      return;
    }

    const newFormula: CustomFormula = {
      entityGuid,
      fieldName,
      type,
      formula,
    };
    this.customFormulas.push(newFormula);
  }

  deleteFormula(entityGuid: string, fieldName: string, type: FormulaType): void {
    const formulaIndex = this.customFormulas.findIndex(c => c.entityGuid === entityGuid && c.fieldName === fieldName && c.type === type);
    if (formulaIndex >= 0) {
      this.customFormulas.splice(formulaIndex, 1);
    }

    const results = this.customFormulaResults$.value;
    const resultIndex = results.findIndex(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.type === type);
    if (resultIndex >= 0) {
      const newResults = [...results.slice(0, resultIndex), ...results.slice(resultIndex + 1)];
      this.customFormulaResults$.next(newResults);
    }
  }

  upsertFormulaResult(entityGuid: string, fieldName: string, type: FormulaType, value: FieldValue, isError: boolean): void {
    const newResult: CustomFormulaResult = {
      entityGuid,
      fieldName,
      type,
      value,
      isError,
    };

    const results = this.customFormulaResults$.value;
    const index = results.findIndex(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.type === type);
    if (index >= 0) {
      const newResults = [...results.slice(0, index), newResult, ...results.slice(index + 1)];
      this.customFormulaResults$.next(newResults);
      return;
    }

    this.customFormulaResults$.next([...results, newResult]);
  }

  getFormulaResult$(entityGuid: string, fieldName: string, type: FormulaType): Observable<CustomFormulaResult> {
    return this.customFormulaResults$.pipe(
      map(results => results.find(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.type === type)),
      distinctUntilChanged(),
    );
  }
}
