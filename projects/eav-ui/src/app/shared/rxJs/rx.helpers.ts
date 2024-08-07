
export class RxHelpers {

  static boolEquals(x: boolean, y: boolean): boolean {
    return x === y;
  }

  static stringEquals(x: string, y: string): boolean {
    return x === y;
  }

  static valueEquals<T>(x: T, y: T): boolean {
    return x === y;
  }

  static manyEquals<T>(x: T, y: T): boolean {
    if (x == null || y == null) return x === y;
    const typeOfX = typeof x;
    if (typeOfX !== typeof y) return false;
    if (typeOfX === 'string' || typeOfX === 'number' || typeOfX === 'boolean')
      return x === y;

    if (Array.isArray(x)) return RxHelpers.arraysEqual(x, y as []);

    return RxHelpers.objectsEqual(x, y);
  }

  static objectsEqual<T>(x: T, y: T): boolean {
    if (x == null || y == null) return x === y;

    const obj1 = x as Record<string, any>;
    const obj2 = y as Record<string, any>;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    const equal = keys1.every(key1 => {
      if (!obj2.hasOwnProperty(key1)) return false;

      return obj1[key1] === obj2[key1];
    });

    return equal;
  }

  static arraysEqual<T>(x: T[], y: T[]): boolean {
    if (x == null || y == null) return x === y;

    if (x.length !== y.length) return false;

    const equal = x.every((item, index) => {
      return x[index] === y[index];
    });

    return equal;
  }

  /** used as .filter(distinct), filters array to only have distinct values */
  static distinct<T>(value: T, index: number, array: T[]): boolean {
    return array.indexOf(value) === index;
  }

}
