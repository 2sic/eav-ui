export class ArrayHelpers {
  /**
   * Toggles an item in an array. If the item is not in the array, it is added. If it is in the array, it is removed.
   * @param item The item to toggle
   * @param array The array to toggle the item in
   */
  static toggleInArray<T>(item: T, array: T[]): void {
    const index = array.indexOf(item);
    if (index === -1) {
      array.push(item);
    } else {
      array.splice(index, 1);
    }
  }

  // probably better: Array.from(new Set(merged));
  // static distinct<T extends unknown>(array: T[]): T[] {
  //   return array.filter(onlyUnique);
  // }

}

// function onlyUnique<T extends unknown>(value: T, index: number, array: T[]): boolean {
//   return array.indexOf(value) === index;
// }