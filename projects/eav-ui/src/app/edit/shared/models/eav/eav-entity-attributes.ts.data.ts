import { EavAttributesDto } from '../json-format-v1';
import { EavEntityAttributes } from './eav-entity-attributes';

interface TestAttributesCreate {
  title: string;
  eav: EavEntityAttributes;
  dto: EavAttributesDto;
}


export const testAttributesDto: EavAttributesDto = {
  'string': {
    'Greeting': { 'en': 'hello', 'fr': 'bonjour' },
    'FirstName': { 'en': 'John', 'fr': 'Jean' },
  },
  'number': {
    'Age': { 'en': 42 },
  }
};

export const testAttributesInternal: EavEntityAttributes = {
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
  },
  Age: {
    Values: [{ value: 42, dimensions: [{ dimCode: 'en' }] }],
    Type: 'number',
  }
};

export const TestDataAttributesCreate: TestAttributesCreate[] = [
  {
    title: 'should convert/flatten a string and a number',
    eav: testAttributesInternal,
    dto: testAttributesDto,
  },
];