import { EavField } from './eav-field';
import { EavFieldTests } from './eav-field.ts.data.spec';




describe('EavField.convert()', () => {
  EavFieldTests.forEach(({ title, dto, type, field }) => {
    it(title, () => expect(EavField.dtoToEav(dto, type)).toEqual(field));
  });
});
