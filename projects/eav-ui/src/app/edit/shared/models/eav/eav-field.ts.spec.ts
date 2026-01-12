import { describe, expect, it } from 'vitest';
import { EavField } from './eav-field';
import { TestDataFieldCreate } from './eav-field.ts.data';

describe('EavField.convert()', () => {
  TestDataFieldCreate.forEach(({ title, dto, type, field }) => {
    it(title, () => expect(EavField.dtoToEav(dto, type)).toEqual(field));
  });
});
