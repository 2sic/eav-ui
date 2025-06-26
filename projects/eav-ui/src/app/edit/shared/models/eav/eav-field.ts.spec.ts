import { EavField } from './eav-field';
import { TestDataFieldCreate } from './eav-field.ts.data.spec';


describe('EavField.convert()', () => {
  TestDataFieldCreate.forEach(({ title, dto, type, field }) => {
    it(title, () => expect(EavField.dtoToEav(dto, type)).toEqual(field));
  });
});
