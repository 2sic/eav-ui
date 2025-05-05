import { EavEntityAttributes } from './eav-entity-attributes';
import { testAttributesDto, testAttributesInternal } from './eav-entity-attributes.ts.data.spec';



describe('EavEntityAttribute.Convert', () => {
  it('should convert a single greeting with one dimension',
    () => expect(EavEntityAttributes.convert({
      'string': {
        'Greeting': { 'en': 'hello' },
      }
    }))
    .toEqual({
      Greeting: {
        Values: [{ Value: 'hello', Dimensions: [{ Value: 'en' }] }],
        Type: 'string',
      }
    }));

  it('should convert a single greeting with two dimensions',
    () => expect(EavEntityAttributes.convert({
      'string': {
        'Greeting': { 'en': 'hello', 'fr': 'bonjour' },
      }
    }))
    .toEqual({
      Greeting: {
        Values: [
          { Value: 'hello', Dimensions: [{ Value: 'en' }] },
          { Value: 'bonjour', Dimensions: [{ Value: 'fr' }] }
        ],
        Type: 'string',
      }
    }));

  it('should convert two strings with two dimension each',
    () => expect(EavEntityAttributes.convert({
      'string': {
        'Greeting': { 'en': 'hello', 'fr': 'bonjour' },
        'FirstName': { 'en': 'John', 'fr': 'Jean' },
      }
    }))
    .toEqual({
      Greeting: {
        Values: [
          { Value: 'hello', Dimensions: [{ Value: 'en' }] },
          { Value: 'bonjour', Dimensions: [{ Value: 'fr' }] }
        ],
        Type: 'string',
      },
      FirstName: {
        Values: [
          { Value: 'John', Dimensions: [{ Value: 'en' }] },
          { Value: 'Jean', Dimensions: [{ Value: 'fr' }] }
        ],
        Type: 'string',
      }
    }));
  
    it('should convert/flatten a string and a number',
      () => expect(EavEntityAttributes.convert(testAttributesDto))
      .toEqual(testAttributesInternal));
  
});
