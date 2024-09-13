import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EavContentType, EavContentTypeAttribute } from '../shared/models/eav';
import { FormulaDesignerService } from './designer/formula-designer.service';
import { FormulaRunOneHelpersFactory } from './formula-run-one-helpers.factory';
import { FormulaPromiseHandler } from './promise/formula-promise-handler';
import { NameValuePair } from './results/formula-results.models';
import { FieldsSettingsHelpers } from '../state/field-settings.helper';
import { FieldsSettingsService } from '../state/fields-settings.service';
import { LoggingService } from '../shared/services/logging.service';
import { FieldProps } from '../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { FieldsPropsEngine } from '../state/fields-properties-engine';
import { FieldsPropsEngineCycle } from '../state/fields-properties-engine-cycle';
import { classLog } from '../../shared/logging';
import { FormulaExecutionSpecsFactory } from './formula-exec-specs.factory';
import { transient } from '../../core';
import { FormulaRunField } from './formula-run-field';
import { DebugFields } from '../edit-debug';

/** The list of fields to debug is used in multiple places */
export const logSpecsFormulaFields = [...DebugFields, 'StringPicker']; // or '*' for all

const logSpecs = {
  all: false,
  getFormulas: false,
  runAllFields: true,
  runFormula: false,
  runOneFieldOrInitSettings: false,
  fields: logSpecsFormulaFields,
};

/**
 * Formula engine is responsible for running formulas and returning the result.
 *
 * Each instance of the engine is responsible for a _single_ entity.
 */
@Injectable()
export class FormulaEngine {

  log = classLog({FormulaEngine}, logSpecs, true);

  #formulaExecSpecsFactory = transient(FormulaExecutionSpecsFactory);

  constructor(
    private designerSvc: FormulaDesignerService,
    private logSvc: LoggingService,
    private translate: TranslateService,
  ) { }

  init(entityGuid: string, settingsSvc: FieldsSettingsService, promiseHandler: FormulaPromiseHandler, contentType: EavContentType, ctTitle: string) {
    this.#entityGuid = entityGuid;
    this.#promiseHandler = promiseHandler;
    this.#attributes = contentType.Attributes;
    this.#contentTypeTitle = ctTitle;
    this.#formulaExecSpecsFactory.init(entityGuid, settingsSvc);
  }

  // properties to set on init
  #entityGuid: string;
  #contentTypeTitle: string;
  #promiseHandler: FormulaPromiseHandler;
  #attributes: EavContentTypeAttribute[];

  runAllFields(engine: FieldsPropsEngine, cycle: FieldsPropsEngineCycle) {
    const fieldsProps: Record<string, FieldProps> = {};
    const valueUpdates: ItemValuesOfLanguage = {};
    const fieldUpdates: NameValuePair[] = [];

    // Many aspects of a field are re-usable across formulas, so we prepare them here
    // These are things explicit to the entity and either never change, or only rarely
    // so never between cycles
    const reuseExecSpecs = this.#formulaExecSpecsFactory.getSharedSpecs();

    const fss = new FieldsSettingsHelpers(this.log.name);

    for (const attr of this.#attributes) {
      const lAttr = this.log.fnIfInList('runAllFields', 'fields', attr.Name, { fieldName: attr.Name });
      const values = cycle.allAttributes[attr.Name];
      const valueBefore = cycle.values[attr.Name];

      const fieldConstants = cycle.getFieldConstants(attr.Name);
      const latestSettings = cycle.getFieldSettingsInCycle(fieldConstants);
      const settingsUpdateHelper = cycle.updateHelper.create(attr, fieldConstants, values);

      const propsBefore = cycle.fieldProps[attr.Name] ?? {} as FieldProps;

      // run formulas
      const runOneHelper = new FormulaRunOneHelpersFactory(this.designerSvc, this.translate, this.logSvc, this.#contentTypeTitle);
      const runOne = new FormulaRunField(this.#promiseHandler, this.designerSvc, this.#entityGuid, runOneHelper);
      const allResults = runOne.runOrInitSettings(
        cycle.values,
        attr.Name,
        fieldConstants,
        latestSettings,
        engine.item.Header,
        valueBefore,
        propsBefore,
        reuseExecSpecs,
        settingsUpdateHelper,
      );

      const fixed = allResults.settings;

      // Add any value changes to the queue for finalizing
      valueUpdates[attr.Name] = allResults.value;

      // If _other_ fields were updated, add it to the queue for later processing
      if (allResults.fields)
        fieldUpdates.push(...allResults.fields);

      const debugDetails = this.log.specs.fields?.includes(attr.Name) || this.log.specs.fields?.includes('*');
      const translationState = fss.getTranslationState(values, fixed.DisableTranslation, engine.languages, debugDetails);

      if (allResults.opts.list)
        lAttr.a('picker options', { options: allResults.opts.list, version: allResults.opts.ver });
      if (allResults.sel.list)
        lAttr.a('picker selected', { selected: allResults.sel.list, version: allResults.opts.ver });

      fieldsProps[attr.Name] = {
        ...propsBefore,
        language: fieldConstants.language,
        constants: fieldConstants,
        settings: fixed,
        translationState,
        value: valueBefore,
        buildWrappers: null, // required, but set elsewhere
        formulaValidation: allResults.validation,
        // Options and Selected. Use spread, as values must be undefined if not updated
        opts: { ...propsBefore.opts, ...allResults.opts, },
        sel: { ...propsBefore.sel, ...allResults.sel, },
      };
    }
    return { fieldsProps, valueUpdates, fieldUpdates };
  }

}

