import { Sxc } from '@2sic.com/2sxc-typings';
import { FormulaFunction, FormulaVersion } from '../formula-definitions';
import { FormulaV1CtxTargetEntity, FormulaV1CtxUser, FormulaV1CtxApp } from '../run/formula-run-context.model';
import { BehaviorSubject } from 'rxjs';
import { FormulaIdentifier, FormulaResultRaw } from '../results/formula-results.models';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

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

  /** Current formula string - including changes from the designer */
  sourceCode: string;

  /** Formula string as it is saved, and loaded from field settings */
  sourceCodeSaved: string;

  /** Guid for saving / updating the current source code */
  sourceCodeGuid: string;

  /** Id for saving / updating the current source code */
  sourceCodeId: number;

  /** Formula version - v1 or v2 */
  version: FormulaVersion;

  /** Information about the input type, so the formula can adjust to it new v18.01 */
  inputType: InputTypeSpecs;

  disabled: boolean;
  disabledReason: string;

  /** if the formula is stopped at the moment */
  stopFormula: boolean;
  promises$: BehaviorSubject<Promise<FieldValue | FormulaResultRaw>>;
  updateCallback$: BehaviorSubject<(result: FieldValue | FormulaResultRaw) => void>;
}

export interface FormulaResultCacheItem extends FormulaIdentifier {
  value: FieldValue;
  isError: boolean;
  isOnlyPromise: boolean;
}

