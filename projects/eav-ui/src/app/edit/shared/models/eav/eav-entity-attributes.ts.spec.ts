import { describe, expect, it } from 'vitest';
import { EavEntityAttributes } from './eav-entity-attributes';
import { TestDataAttributesCreate } from './eav-entity-attributes.ts.data';


describe('EavEntityAttribute.Convert', () => {
  it('should convert a single greeting with one dimension',
    () => expect(EavEntityAttributes.dtoToEav({
      'string': {
        'Greeting': { 'en': 'hello' },
      }
    }))
    .toEqual({
      Greeting: {
        Values: [{ value: 'hello', dimensions: [{ dimCode: 'en' }] }],
        Type: 'string',
      }
    }));

  it('should convert a single greeting with two dimensions',
    () => expect(EavEntityAttributes.dtoToEav({
      'string': {
        'Greeting': { 'en': 'hello', 'fr': 'bonjour' },
      }
    }))
    .toEqual({
      Greeting: {
        Values: [
          { value: 'hello', dimensions: [{ dimCode: 'en' }] },
          { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] }
        ],
        Type: 'string',
      }
    }));

  it('should convert two strings with two dimension each',
    () => expect(EavEntityAttributes.dtoToEav({
      'string': {
        'Greeting': { 'en': 'hello', 'fr': 'bonjour' },
        'FirstName': { 'en': 'John', 'fr': 'Jean' },
      }
    }))
    .toEqual({
      Greeting: {
        Values: [
          { value: 'hello', dimensions: [{ dimCode: 'en' }] },
          { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] }
        ],
        Type: 'string',
      },
      FirstName: {
        Values: [
          { value: 'John', dimensions: [{ dimCode: 'en' }] },
          { value: 'Jean', dimensions: [{ dimCode: 'fr' }] }
        ],
        Type: 'string',
      }
    }));


    // Loop through TestDataAttributesCreate and test each one
    TestDataAttributesCreate.forEach(({ eav, dto, title }) => {
      it(title, () => expect(EavEntityAttributes.dtoToEav(dto)).toEqual(eav));
    });
  
});
