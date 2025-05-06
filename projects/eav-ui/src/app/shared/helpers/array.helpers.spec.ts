import { ArrayHelpers } from './array.helpers';

describe('ArrayHelpers', () => {
  // Demo of a more compact test - less code to maintain
  it('should add an item if it is not in the array',
    () => expect(ArrayHelpers.toggleInArray(4, [1, 2, 3]))
      .toEqual([1, 2, 3, 4]));

  it('should remove an item if it is in the array', () => {
    const array = [1, 2, 3];
    ArrayHelpers.toggleInArray(2, array);
    expect(array).toEqual([1, 3]);
  });

  it('should handle toggling a string item', () => {
    const array = ['apple', 'banana'];
    ArrayHelpers.toggleInArray('banana', array);
    expect(array).toEqual(['apple']);
  });

  it('should handle toggling a boolean value', () => {
    const array = [true, false];
    ArrayHelpers.toggleInArray(true, array);
    expect(array).toEqual([false]);
  });

  it('should add an item to an empty array', () => {
    const array: number[] = [];
    ArrayHelpers.toggleInArray(1, array);
    expect(array).toEqual([1]);
  });
});
