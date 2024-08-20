import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { ItemService } from '../shared/store/ngrx-data';
import { FormulaHelpers } from './helpers/formula.helpers';
import { FormulaTargets } from './models/formula.models';
import { DesignerState } from './models/formula-results.models';
import { RxHelpers } from '../../shared/rxJs/rx.helpers';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { transient } from '../../core';
import { FormulaTargetsService } from './formula-targets.service';
import { EntityOption, FieldOption } from '../dialog/footer/formula-designer/formula-designer.models';
import { FormulaV1Helpers } from './helpers/formula-v1.helpers';
import { FormulaCacheService } from './formula-cache.service';
import { FieldsSettingsService } from '../state/fields-settings.service';

const logThis = true;
const nameOfThis = 'FormulaDesignerService';

/**
 * Contains methods for extended CRUD operations for formulas.
 */
@Injectable()
export class FormulaDesignerService extends ServiceBase implements OnDestroy {

  /**
   * Contain all the settings to all items/settings in this form
   * for rare cases (formulas) which need to access settings of all items
   */
  itemSettingsServices: Record<string, FieldsSettingsService> = {};

  cache = transient(FormulaCacheService);

  /** The current state of the UI, what field is being edited etc. */
  designerState = signal<DesignerState>({
    editMode: false,
    entityGuid: undefined,
    fieldName: undefined,
    isOpen: false,
    target: undefined,
  } satisfies DesignerState, { equal: RxHelpers.objectsEqual });

  formulaResult = computed(() => {
    const state = this.designerState();
    const results = this.cache.results();
    return results.find(r => r.entityGuid === state.entityGuid && r.fieldName === state.fieldName && r.target === state.target)
      {};
  }, { equal: RxHelpers.objectsEqual });

  #targetsService = transient(FormulaTargetsService);

  currentTargetOptions = computed(() => {
    const state = this.designerState();
    const formulas = this.cache.formulas();
    return this.#targetsService.getTargetOptions(state, formulas);
  }, { equal: RxHelpers.objectsEqual });

  /** Possible entities incl. state if they have formulas */
  entityOptions = computed<EntityOption[]>(() => {
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
  fieldsOptions = computed(() => {
    const guid = this.designerState().entityGuid;
    if (guid == null)
      return [];
    const entityFormulas = this.entityOptions().find(e => e.entityGuid == guid).formulas;
    // find the current fieldSettingsService to get all properties
    const selectedSettings = this.itemSettingsServices[guid];
    const fieldsProps = selectedSettings.getFieldsProps();
    const fieldOptions: FieldOption[] = Object.keys(fieldsProps).map(fieldName => {
      const formulas = entityFormulas.filter(f => f.fieldName === fieldName);
      const inputType = fieldsProps[fieldName].settings.InputType;
      return {
        fieldName,
        formulas,
        hasFormula: formulas.length > 0,
        inputType,
        label: fieldName,
      } satisfies FieldOption;
    });
    return fieldOptions;
  });

  constructor(
    private itemService: ItemService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  init(): void {
    this.cache.init(this);
  }

  initAfterItemSettingsAreReady(): void {
    // Initialize the first designer state to contain the first item and field
    const oldState = this.designerState();
    const [entityGuid, settingsSvc] = Object.entries(this.itemSettingsServices)[0];
    const fieldsProps = settingsSvc.getFieldsProps();
    const fieldName = Object.keys(fieldsProps)[0];
    const target = fieldName != null ? FormulaTargets.Value : null;

    const newState: DesignerState = {
      ...oldState,
      entityGuid,
      fieldName,
      target,
    };
    this.designerState.set(newState);
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  /** The currently selected formula or null */
  currentFormula = computed(() => {
    const s = this.designerState();
    const formulas = this.cache.formulas();
    return formulas.find(f => f.entityGuid === s.entityGuid && f.fieldName === s.fieldName && f.target === s.target);
  }, { equal: RxHelpers.objectsEqual });

  /** Snippets for the current formula based on it's version */
  v1ContextSnippets = computed(() => {
    const current = this.currentFormula();
    return current != null
    ? FormulaV1Helpers.buildDesignerSnippetsContext(current)
    : [];
  }, { equal: RxHelpers.objectsEqual });

  /** Snippets for the current item header based on the current formulas target guid */
  #currentItemHeader = computed(() => {
    const guid = this.designerState().entityGuid;
    return guid == null ? null : this.itemService.getItemHeader(guid);
  }, { equal: RxHelpers.objectsEqual });

  /** JS Typings for V2 formulas - all the properties and type names */
  v2JsTypings = computed(() => {
    const formula = this.currentFormula();
    const itemHeader = this.#currentItemHeader();
    return formula != null && itemHeader != null
      ? FormulaHelpers.buildFormulaTypings(formula, this.fieldsOptions(), itemHeader.Prefill)
      : ''
  }, { equal: RxHelpers.objectsEqual });

  /** Data snippets for the current formula V1 - all the data that can be used in formulas */
  v1DataSnippets = computed(() => {
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
