import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { DataTypeCatalog } from "../../../shared/fields/data-type-catalog";
import { InputTypeCatalog } from "../../../shared/fields/input-type-catalog";
import { classLog } from '../../../shared/logging';
import { DebugFields } from '../../edit-debug';
import { StateUiMapperBase } from '../../fields/picker/adapters/state-ui-mapper-base';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { EavContentType } from '../../shared/models/eav/eav-content-type';
import { FieldFormulasResultRaw, FieldValueOrResultRaw } from "./formula-results.models";

const logSpecs = {
  all: false,
  v1: false,
  v2: false,
  allValues: true,
  oneValue: true,
  fields: [...DebugFields],
}

/**
 * Contains methods for correcting formula results.
 */
export class FormulaValueCorrections {

  log = classLog({FormulaValueCorrections}, logSpecs);

  constructor(
    private contentType: EavContentType,
    // private contentTypeSvc: ContentTypeService,
    private entityGuid: string,
    private fieldName: string,
    private isValue: boolean,
    private inputType: InputTypeSpecs,
    private isOpen: boolean,
    private valueMapper?: StateUiMapperBase,
  ) { }


  v1(v1Result: FieldValueOrResultRaw): { ok: boolean, v1Result: FieldFormulasResultRaw } {
    const isArray = v1Result && Array.isArray(v1Result) && v1Result.every(r => typeof r === 'string');
    const resultIsPure = ['string', 'number', 'boolean'].includes(typeof v1Result) || v1Result instanceof Date || isArray || !v1Result;
    if (!resultIsPure)
      return { ok: false, v1Result: this.toFormulaResult(undefined) };

    const v1Value = this.isValue
      ? this.#oneValue(v1Result as FieldValue)
      : v1Result as FieldValue;
    return { ok: true, v1Result: this.toFormulaResult(v1Value) };
  }

  v2(result: FieldValueOrResultRaw): FieldFormulasResultRaw {
    const raw = this.allValues(result);
    return { ...raw, openInDesigner: this.isOpen };
  }

  /**
   * This method is used to support duck typing in the formula result and from it to fill FormulaResultRaw object with corrected values.
   * @param target Formula target
   * @param result Formula result
   * @param inputType InputType is needed to check if the result is a date which needs to be corrected
   * @returns Strongly typed FormulaResultRaw object
   */
  allValues(result: FieldValueOrResultRaw): FieldFormulasResultRaw {
    const l = this.log.fnIfInList('allValues', 'fields', this.fieldName, { result });

    // if (l.enabled)
    //   debugger;

    // 2024-09-10 21:15 2dm changed this, as I believe all cases have a clear stop-value
    // const stop = (result as FormulaResultRaw)?.stop ?? null;
    const defaults: Partial<FieldFormulasResultRaw> = { value: undefined, fields: [], stop: null, sleep: null };
    if (result == null)
      return l.r({ ...defaults, value: result as FieldValue}, 'null/empty');
    
    const targetIsValue = this.isValue;

    // Show warning if array - new v18 newPicker
    if (Array.isArray(result)) {
      console.warn('Formula result was an array - this is not allowed. Please return an object containing the array instead: { value: [...] }.', result);
      return l.r(defaults, 'array');
    }

    // Handle object results - the larger / more complex case
    if (typeof result === 'object') {
      if (result instanceof Date && targetIsValue)
        return l.r({ ...defaults, value: this.#oneValue(result) }, 'date');

      if (result instanceof Promise)
        return l.r({
          ...defaults,
          value: undefined,
          promise: result as Promise<FieldFormulasResultRaw>,
        }, 'promise');

      const raw: FieldFormulasResultRaw = result as FieldFormulasResultRaw;

      // fix stop so it's never undefined
      raw.stop ??= null;
      raw.sleep ??= null;

      // Fix single value - but only if it's not an array, in which case we must leave as is
      if (raw.value && targetIsValue)
        raw.value = Array.isArray(raw.value)
          ? this.valueMapper?.toState(raw.value) ?? raw.value
          : this.#oneValue(raw.value);

      // fix fields
      if (raw.fields)
        raw.fields = raw.fields?.map(f => {
          f.value = this.#oneValue(f.value, f.name);
          return f;
        });

      // test options
      if (raw.options) {
        if (!Array.isArray(raw.options)) {
          console.error('options is not an array', raw.options);
          raw.options = [];
        } else if (raw.options.length > 0) {
          if (raw.options.find(o => !o || o.value == null)) {
            console.error('some options are missing value', raw.options);
            raw.options = [];
          }
          if (hasDuplicateValues(raw.options)) {
            console.error('duplicate values in options', raw.options);
            raw.options = [];
          }
        }
      }
      return l.r(raw, 'object');
    }

    // Non-Object results
    const value: FieldFormulasResultRaw = { value: result as FieldValue };

    // Handle value only result
    // atm we are only correcting Value formulas
    if (targetIsValue)
      return l.r({ ...defaults, value: this.#oneValue(value.value) }, 'non-object, value');
    return l.r(value, 'non-object, non-value');
  }

  /**
   * Used to correct datetime field value from formula result.
   * @param value Field value from formula result
   * @param inputType InputType is needed to check if the result is a date which needs to be corrected
   * @returns Corrected field value
   */
  #oneValue(value: FieldValue | Date, otherFieldName: string = null): FieldValue {
    const l = this.log.fnIf('oneValue', { fieldName: this.fieldName, otherFieldName, value, type: typeof value });
    if (value == null)
      return l.r(value as FieldValue, 'null');

    let inputType = this.inputType.inputType;

    // If doing this for another field, we must lookup the definition of the other field and handle it's expected input type
    if (otherFieldName) {
      const otherAttribute = this.contentType.Attributes.find(a => a.Name === otherFieldName);
      
      if (!otherAttribute?.InputType)
        return l.r(value as FieldValue, `other field ${otherFieldName}; value not changed as target field not found`);
            
      inputType = otherAttribute.InputType;
      l.a(`other field ${otherFieldName} found, inputType: ${inputType}`);
    }


    if (inputType === InputTypeCatalog.DateTimeDefault || value instanceof Date) {
      const date = new Date(value as string | number | Date);

      // if value is not ISO string, nor milliseconds, correct timezone
      if (!(typeof value === 'string' && value.endsWith('Z')) && date.getTime() !== value)
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);

      date.setMilliseconds(0);
      return l.r(date.toJSON(), 'date');
    }
    
    if (typeof (value) !== 'string' && (inputType?.startsWith(DataTypeCatalog.String.toLocaleLowerCase())
      || inputType?.startsWith(DataTypeCatalog.Hyperlink.toLocaleLowerCase()))) {
      return l.r(value.toString(), 'not string, but input is string or hyperlink');
    }
    return l.r(value, 'unchanged');
  }


  toFormulaResult(value: FieldValue): FieldFormulasResultRaw {
    return {
      value,
      fields: [],
      stop: null,
      sleep: null,
      openInDesigner: this.isOpen
    };
  }
}

function hasDuplicateValues(options: PickerItem[]) {
  var ids = options.map(o => o.value);
  var uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error('Duplicate values in options', options, ids, uniqueIds);
    return true;
  }
  return false;
}