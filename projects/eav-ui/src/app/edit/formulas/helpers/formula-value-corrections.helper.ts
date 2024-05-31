import { FieldValue } from "projects/edit-types";
import { DataTypeConstants } from "../../../content-type-fields/constants/data-type.constants";
import { InputTypeConstants } from "../../../content-type-fields/constants/input-type.constants";
import { InputType } from "../../../content-type-fields/models/input-type.model";
import { FormulaTarget, FormulaTargets } from "../models/formula.models";
import { FormulaResultRaw } from "../models/formula-results.models";

/**
 * Contains methods for correcting formula results.
 */
export class FormulaValueCorrections {

  /**
   * This method is used to support ducktyping in the formula result and from it to fill FormulaResultRaw object with corrected values.
   * @param target Formula target
   * @param result Formula result
   * @param inputType InputType is needed to check if the result is a date which needs to be corrected
   * @returns Strongly typed FormulaResultRaw object
   */
  static correctAllValues(target: FormulaTarget, result: FieldValue | FormulaResultRaw, inputType: InputType): FormulaResultRaw {
    const stop = (result as FormulaResultRaw)?.stop ?? null;
    if (result === null || result === undefined)
      return { value: result as FieldValue, fields: [], stop };
    if (typeof result === 'object') {
      if (result instanceof Date && target === FormulaTargets.Value)
        return { value: this.valueCorrection(result as FieldValue, inputType), fields: [], stop };
      if (result instanceof Promise)
        return { value: undefined, promise: result as Promise<FormulaResultRaw>, fields: [], stop };
      const corrected: FormulaResultRaw = (result as FormulaResultRaw);
      corrected.stop = stop;
      if ((result as FormulaResultRaw).value && target === FormulaTargets.Value) {
        corrected.value = this.valueCorrection((result as FormulaResultRaw).value, inputType);
      }
      if ((result as FormulaResultRaw).fields) {
        corrected.fields = (result as FormulaResultRaw).fields?.map((fields) => {
          fields.value = this.valueCorrection(fields.value, inputType);
          return fields;
        });
        return corrected;
      }
      return corrected;
    }
    const value: FormulaResultRaw = { value: result as FieldValue };

    // atm we are only correcting Value formulas
    if (target === FormulaTargets.Value) {
      return { value: this.valueCorrection(value.value, inputType), fields: [], stop };
    }
    return value;
  }

  /**
   * Used to correct datetime field value from formula result.
   * @param value Field value from formula result
   * @param inputType InputType is needed to check if the result is a date which needs to be corrected
   * @returns Corrected field value
   */
  static valueCorrection(value: FieldValue, inputType: InputType): FieldValue {
    if (value == null) {
      return value;
    } else if (inputType?.Type === InputTypeConstants.DateTimeDefault) {
      const date = new Date(value as string | number | Date);

      // if value is not ISO string, nor milliseconds, correct timezone
      if (!(typeof value === 'string' && value.endsWith('Z')) && date.getTime() !== value) {
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);
      }

      date.setMilliseconds(0);
      return date.toJSON();
    } else if (typeof (value) !== 'string' && (inputType?.Type?.startsWith(DataTypeConstants.String.toLocaleLowerCase())
      || inputType?.Type?.startsWith(DataTypeConstants.Hyperlink.toLocaleLowerCase()))) {
      return value.toString();
    }
    return value;
  }
}