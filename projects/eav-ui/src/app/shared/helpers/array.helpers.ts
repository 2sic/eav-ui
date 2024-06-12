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
}