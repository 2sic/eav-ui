import { EavFieldValue } from './eav-field-value';
import { EavFieldValueConvertTests, EavFieldValueCreateTests, TestDataFieldValueCreate } from './eav-field-value.ts.data.spec';


describe('EavValue.Create', () => {
  TestDataFieldValueCreate.forEach(({ title, value, dimensions, expected }) => {
    it(title, () => expect(EavFieldValue.create(value, dimensions)).toEqual(expected));
  });
});


describe('EavValue.Convert', () => {
  EavFieldValueConvertTests.forEach(({ title, value, expected }) => {
    it(title, () => expect(EavFieldValue.dtoToEav(value)).toEqual(expected));
  });
});


describe('EavFieldValue.createEavFieldValue', () => {
  EavFieldValueCreateTests.forEach(({ title, input, expected }) => {
    it(title, () => {
      const result = EavFieldValue.createEavFieldValue(input.value);
      expect(result).toEqual(expected);
    });
  });
});