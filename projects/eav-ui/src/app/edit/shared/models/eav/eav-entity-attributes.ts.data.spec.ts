import { EavAttributesDto } from '../json-format-v1';
import { EavEntityAttributes } from './eav-entity-attributes';

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
  },
  Age: {
    Values: [{ Value: 42, Dimensions: [{ Value: 'en' }] }],
    Type: 'number',
  }
};