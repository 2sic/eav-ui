export class GeneralHelpers {

  static objectsEqual<T>(x: T, y: T): boolean {
    const obj1 = x as { [key: string]: any };
    const obj2 = y as { [key: string]: any };

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
}
