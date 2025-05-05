import { EavField } from './eav-field';

describe('EavField.convert()', () => {
  it('should convert a basic value with one dimension',
    () => expect(EavField.convert({ 'en': 'hello' }, 'string'))
      .toEqual({
        Values: [{ value: 'hello', dimensions: [{ dimCode: 'en' }] }],
        Type: 'string',
      }));

  it('should convert a double-value with one dimension each',
    () => expect(EavField.convert({ 'en': 'hello', 'fr': 'bonjour' }, 'string'))
      .toEqual({
        Values: [
          { value: 'hello', dimensions: [{ dimCode: 'en' }] },
          { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] }
        ],
        Type: 'string',
      }));
});
