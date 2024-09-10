import { Injectable } from '@angular/core';
import { FormulaTargets } from '../targets/formula-targets';
import { DesignerState } from './designer-state.model';
import { transient } from '../../../core';
import { FormulaTargetsService } from '../targets/formula-targets.service';
import { EntityOption, FieldOption, TargetOption } from '../../dialog/footer/formula-designer/formula-designer.models';
import { FormulaV1Helpers } from './formula-v1-snippets';
import { FormulaCacheService } from '../cache/formula-cache.service';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { ItemService } from '../../state/item.service';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { IntellisenseV2 } from './intellisense-v2';
import { classLog } from '../../../shared/logging';

/**
 * Contains methods for extended CRUD operations for formulas.
 */
@Injectable()
export class FormulaDesignerService {

  log = classLog({FormulaDesignerService});

  /**
   * Contain all the settings to all items/settings in this form
   * for rare cases (formulas) which need to access settings of all items
   */
  public itemSettingsServices: Record<string, FieldsSettingsService> = {};

  public cache = transient(FormulaCacheService);

  /** The current state of the UI, what field is being edited etc. */
  public designerState = signalObj<DesignerState>('designerState', {
    editMode: false,
    entityGuid: undefined,
    fieldName: undefined,
    isOpen: false,
    target: undefined,
  } satisfies DesignerState);

  /** Formula result of the formula which is currently open in the editor */
  formulaResult = computedObj('formulaResult', () => {
    const state = this.designerState();
    return this.cache.resultListIndexAndOriginal(state).value;
  });

  #targetsService = transient(FormulaTargetsService);

  currentTargetOptions = computedObj<TargetOption[]>('currentTargetOptions', () => {
    const state = this.designerState();
    const formulas = this.cache.formulas();
    return this.#targetsService.getTargetOptions(state, formulas);
  });

  /** Possible entities incl. state if they have formulas */
  entityOptions = computedObj<EntityOption[]>('entityOptions', () => {
    // this is a signal, so this will change when the data is loaded...
    const formulas = this.cache.formulas();
    return Object.entries(this.itemSettingsServices).map(([entityGuid, settingsSvc]) => {
      const entityFormulas = formulas.filter(f => f.entityGuid === entityGuid);
      return {
        entityGuid: entityGuid,
        formulas: entityFormulas,
        hasFormula: entityFormulas.length > 0,
        label: settingsSvc.contentTypeSettings()._itemTitle,
      } satisfies EntityOption;
    })
  });

  /** possible fields of the current entity incl. state such as if it has formulas */
  fieldsOptions = computedObj<FieldOption[]>('fieldsOptions', () => {
    const guid = this.designerState().entityGuid;
    if (guid == null)
      return [];
    const entityFormulas = this.entityOptions().find(e => e.entityGuid == guid).formulas;
    // find the current fieldSettingsService to get all properties
    const selectedSettings = this.itemSettingsServices[guid];
    const fieldsProps = selectedSettings.allProps();
    const fieldOptions: FieldOption[] = Object.keys(fieldsProps).map(fieldName => {
      const formulas = entityFormulas.filter(f => f.fieldName === fieldName);
      return {
        fieldName,
        formulas,
        hasFormula: formulas.length > 0,
        inputType: fieldsProps[fieldName].settings.InputType,
        label: fieldName,
      } satisfies FieldOption;
    });
    return fieldOptions;
  });

  constructor(
    private itemService: ItemService,
  ) {
    this.log.a('constructor');
  }

  init(): void {
    this.cache.init();
  }

  initAfterItemSettingsAreReady(): void {
    // Initialize the first designer state to contain the first item and field
    const oldState = this.designerState();
    const [entityGuid, settingsSvc] = Object.entries(this.itemSettingsServices)[0];
    const fieldsProps = settingsSvc.allProps();
    const firstFieldName = Object.keys(fieldsProps)[0];
    const target = firstFieldName != null ? FormulaTargets.Value : null;

    const newState: DesignerState = {
      ...oldState,
      entityGuid,
      fieldName: firstFieldName,
      target,
    };
    this.designerState.set(newState);
  }

  /** The currently selected formula or null */
  currentFormula = computedObj<FormulaCacheItem>('currentFormula', () => {
    const s = this.designerState();
    const { value } = this.cache.formulaListIndexAndOriginal(s);
    return value;
  });

  /** Snippets for the current formula based on it's version */
  v1ContextSnippets = computedObj('v1ContextSnippets', () => {
    const current = this.currentFormula();
    return current != null
    ? FormulaV1Helpers.buildDesignerSnippetsContext(current)
    : [];
  });

  /** Snippets for the current item header based on the current formulas target guid */
  #currentItemHeader = computedObj('currentItemHeader', () => {
    const guid = this.designerState().entityGuid;
    return guid == null ? null : this.itemService.getItemHeader(guid);
  });

  /** JS Typings for V2 formulas - all the properties and type names */
  v2JsTypings = computedObj('v2JsTypings', () => {
    const formula = this.currentFormula();
    const itemHeader = this.#currentItemHeader();
    return formula != null && itemHeader != null
      ? IntellisenseV2.buildFormulaTypingsV2(formula, this.fieldsOptions(), itemHeader.Prefill)
      : ''
  });

  /** Data snippets for the current formula V1 - all the data that can be used in formulas */
  v1DataSnippets = computedObj('v1DataSnippets', () => {
    const formula = this.currentFormula();
    const itemHeader = this.#currentItemHeader();
    return formula != null && itemHeader != null
    ? FormulaV1Helpers.getSnippets(formula, this.fieldsOptions(), itemHeader.Prefill)
    : []
  });


  /**
   * Used for opening or closing designer
   * @param isOpen
   */
  setDesignerOpen(isOpen: boolean): void {
    this.designerState.set({
      ...this.designerState(),
      isOpen,
    } satisfies DesignerState);
  }


}
