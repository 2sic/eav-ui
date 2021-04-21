import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';

export class GeneralHelpers {

  static objectsEqual<T>(x: T, y: T): boolean {
    const obj1 = x as Dictionary;
    const obj2 = y as Dictionary;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) { return false; }

    const equal = keys1.every(key1 => {
      if (!obj2.hasOwnProperty(key1)) { return false; }

      return obj1[key1] === obj2[key1];
    });

    return equal;
  }

  static arraysEqual<T>(x: T[], y: T[]): boolean {
    if (x.length !== y.length) { return false; }

    const equal = x.every((item, index) => {
      return x[index] === y[index];
    });

    return equal;
  }

  /** Searches where newValues has values different from oldValues */
  static getFormChanges(oldValues: FormValues, newValues: FormValues): FormValues {
    const changes: FormValues = {};
    for (const key of Object.keys(newValues)) {
      const newValue = newValues[key];
      const oldValue = oldValues[key];
      if (Array.isArray(newValue) && Array.isArray(oldValue) && GeneralHelpers.arraysEqual(newValue, oldValue)) { continue; }
      if (newValue === oldValue) { continue; }

      changes[key] = newValue;
    }
    return Object.keys(changes).length === 0 ? undefined : changes;
  }
}
