import { EavField } from './eav-field';

describe('EavField.convert()', () => {
  it('should convert a basic value with one dimension',
    () => expect(EavField.convert({ 'en': 'hello' }, 'string'))
      .toEqual({
        Values: [{ Value: 'hello', Dimensions: [{ Value: 'en' }] }],
        Type: 'string',
      }));

  it('should convert a double-value with one dimension each',
    () => expect(EavField.convert({ 'en': 'hello', 'fr': 'bonjour' }, 'string'))
      .toEqual({
        Values: [
          { Value: 'hello', Dimensions: [{ Value: 'en' }] },
          { Value: 'bonjour', Dimensions: [{ Value: 'fr' }] }
        ],
        Type: 'string',
      }));
});
