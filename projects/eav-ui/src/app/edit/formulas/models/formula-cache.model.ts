import { Sxc } from '@2sic.com/2sxc-typings';
import { FormulaFunction, FormulaVersion } from './formula.models';
import { FormulaV1CtxTargetEntity, FormulaV1CtxUser, FormulaV1CtxApp } from './formula-run-context.model';
import { FieldValue } from 'projects/edit-types';
import { BehaviorSubject } from 'rxjs';
import { FormulaIdentifier, FormulaResultRaw } from './formula-results.models';

/**
 * Formula Cached Values which are re-used across formulas of the same entity.
 */

export interface FormulaCacheItemConstants {
  /** Target information which stays the same across cycles, new cached in 14.07.05 */
  targetEntity: FormulaV1CtxTargetEntity;
  /** User which stays the same across cycles, new cached in 14.07.05 */
  user: FormulaV1CtxUser;
  /** App which stays the same across cycles, new cached in 14.07.05 */
  app: FormulaV1CtxApp;
  sxc: Sxc;
}

export interface FormulaCacheItem extends FormulaCacheItemConstants, FormulaIdentifier {
  /** Data cache which can use inside the formula */
  cache: Record<string, any>;

  /** Function built when formula is saved */
  fn: FormulaFunction;

  /** Is formula currently being edited (not yet saved) */
  isDraft: boolean;

  /** Current formula string */
  source: string;

  /** Formula string in field settings */
  sourceFromSettings: string;

  sourceGuid: string;
  sourceId: number;

  /** Formula version - v1 or v2 */
  version: FormulaVersion;

  /** if the formula is stopped at the moment */
  stopFormula: boolean;
  promises$: BehaviorSubject<Promise<FieldValue | FormulaResultRaw>>;
  updateCallback$: BehaviorSubject<(result: FieldValue | FormulaResultRaw) => void>;
}

