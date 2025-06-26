import { EavField } from './eav-field';

interface TestFieldCreate {
  /** Test Name */
  title: string;
  /** Dto representation */
  dto: Record<string, string>;
  /** Type of the field */
  type: string;
  /** EavField representation */
  field: EavField<string>;
}

export const TestDataFieldCreate: TestFieldCreate[] = [
  {
    title: 'should convert a basic value with one dimension',
    dto: { 'en': 'hello' },
    type: 'string',
    field: { Values: [{ value: 'hello', dimensions: [{ dimCode: 'en' }] }], Type: 'string' },
  },
  {
    title: 'should convert a double-value with one dimension each',
    dto: { 'en': 'hello', 'fr': 'bonjour' },
    type: 'string',
    field: { Values: [
      { value: 'hello', dimensions: [{ dimCode: 'en' }] },
      { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] }
    ], Type: 'string' },
  },
  {
    title: 'should convert a double-value with one to two dimension each',
    dto: { 'en,de': 'hello', 'fr': 'bonjour' },
    type: 'string',
    field: { Values: [
      { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: 'de' }] },
      { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] }
    ], Type: 'string' },
  },
];