import { TestDataFieldCreate } from '../eav/eav-field.ts.data.spec';
import { EavValuesDto } from './eav-values-dto';

describe('EavValuesDto.valuesToDto()', () => {
  TestDataFieldCreate.forEach(({ title, dto, field }) => {
    it(title, () => expect(EavValuesDto.eavToDto(field)).toEqual(dto));
  });
});
