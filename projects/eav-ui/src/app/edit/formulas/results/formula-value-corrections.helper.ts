import { DataTypeCatalog } from "../../../shared/fields/data-type-catalog";
import { InputTypeCatalog, InputTypeStrict } from "../../../shared/fields/input-type-catalog";
import { FormulaResultRaw } from "./formula-results.models";
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { PickerItem } from '../../fields/picker/models/picker-item.model';

/**
 * Contains methods for correcting formula results.
 */
export class FormulaValueCorrections {

  constructor(private isValue: boolean, private inputType: InputTypeStrict, private isOpen: boolean) {
  }

  v1(v1Result: FieldValue | FormulaResultRaw): { ok: boolean, v1Result: FormulaResultRaw } {
    const isArray = v1Result && Array.isArray(v1Result) && (v1Result as any).every((r: any) => typeof r === 'string');
    const resultIsPure = ['string', 'number', 'boolean'].includes(typeof v1Result) || v1Result instanceof Date || isArray || !v1Result;
    if (!resultIsPure)
      return { ok: false, v1Result: this.toFormulaResult(undefined) };

    const v1Value = this.isValue
      ? this.#oneValue(v1Result as FieldValue)
      : v1Result as FieldValue;
    return { ok: true, v1Result: this.toFormulaResult(v1Value) };
  }

  v2(result: FieldValue | FormulaResultRaw): FormulaResultRaw {
    const beforeIsOpen = this.allValues(result);
    return { ...beforeIsOpen, openInDesigner: this.isOpen };
  }

  /**
   * This method is used to support duck typing in the formula result and from it to fill FormulaResultRaw object with corrected values.
   * @param target Formula target
   * @param result Formula result
   * @param inputType InputType is needed to check if the result is a date which needs to be corrected
   * @returns Strongly typed FormulaResultRaw object
   */
  allValues(result: FieldValue | FormulaResultRaw): FormulaResultRaw {
    // 2024-09-10 21:15 2dm changed this, as I believe all cases have a clear stop-value
    // const stop = (result as FormulaResultRaw)?.stop ?? null;
    if (result === null || result === undefined)
      return { value: result as FieldValue, fields: [], stop: null };
    
    const targetIsValue = this.isValue;

    // Handle object results - the larger / more complex case
    if (typeof result === 'object') {
      if (result instanceof Date && targetIsValue)
        return { value: this.#oneValue(result as FieldValue), fields: [], stop: null };

      if (result instanceof Promise)
        return { value: undefined, promise: result as Promise<FormulaResultRaw>, fields: [], stop: null };

      const raw: FormulaResultRaw = result as FormulaResultRaw;

      // fix stop so it's never undefined
      raw.stop ??= null;

      // fix single value
      if (raw.value && targetIsValue)
        raw.value = this.#oneValue(raw.value);

      // fix fields
      if (raw.fields)
        raw.fields = raw.fields?.map(f => {
          f.value = this.#oneValue(f.value);
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
      return raw;
    }
    const value: FormulaResultRaw = { value: result as FieldValue };

    // Handle value only result
    // atm we are only correcting Value formulas
    if (targetIsValue) {
      return { value: this.#oneValue(value.value), fields: [], stop: null };
    }
    return value;
  }

  /**
   * Used to correct datetime field value from formula result.
   * @param value Field value from formula result
   * @param inputType InputType is needed to check if the result is a date which needs to be corrected
   * @returns Corrected field value
   */
  #oneValue(value: FieldValue): FieldValue {
    if (value == null)
      return value;

    const inputTypeName = this.inputType;
    
    if (inputTypeName === InputTypeCatalog.DateTimeDefault) {
      const date = new Date(value as string | number | Date);

      // if value is not ISO string, nor milliseconds, correct timezone
      if (!(typeof value === 'string' && value.endsWith('Z')) && date.getTime() !== value) {
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);
      }

      date.setMilliseconds(0);
      return date.toJSON();
    }
    
    if (typeof (value) !== 'string' && (inputTypeName?.startsWith(DataTypeCatalog.String.toLocaleLowerCase())
      || inputTypeName?.startsWith(DataTypeCatalog.Hyperlink.toLocaleLowerCase()))) {
      return value.toString();
    }
    return value;
  }


  toFormulaResult(value: FieldValue): FormulaResultRaw {
    return {
      value,
      fields: [],
      stop: null,
      openInDesigner: this.isOpen
    };
  }
}

function hasDuplicateValues(options: PickerItem[]) {
  var ids = options.map(o => o.value);
  var uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error('Duplicate values in options', options);
    return true;
  }
  return false;
}