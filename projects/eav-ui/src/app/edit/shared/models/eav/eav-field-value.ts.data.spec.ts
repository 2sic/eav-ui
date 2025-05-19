import { EavDimension } from './eav-dimension';
import { EavFieldValue } from './eav-field-value';
import { EavTypeMap, EavTypeName } from './eav-item';

interface TestFieldValueCreate {
  title: string;
  value: string;
  dimensions: EavDimension[];
  expected: EavFieldValue<string>;
}

export const TestDataFieldValueCreate: TestFieldValueCreate[] = [
  {
    title: 'should create a basic value without dimensions',
    value: 'hello',
    dimensions: [],
    expected: { value: 'hello', dimensions: [] },
  },
  {
    title: 'should create a basic value with a single dimension',
    value: 'hello',
    dimensions: [EavDimension.create('en')],
    expected: { value: 'hello', dimensions: [{ dimCode: 'en' }] },
  },
  {
    title: 'should create a basic value with multiple dimensions',
    value: 'hello',
    dimensions: [EavDimension.create('en'), EavDimension.create('fr')],
    expected: { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: 'fr' }] },
  },
];

interface EavFieldValueTestConvert {
  title: string;
  value: Record<string, string>;
  expected: EavFieldValue<string>[];
}

export const EavFieldValueConvertTests: EavFieldValueTestConvert[] = [
  {
    title: 'should convert a basic value with one dimension',
    value: { 'en': 'hello' },
    expected: [{ value: 'hello', dimensions: [{ dimCode: 'en' }] }],
  },
  {
    title: 'should convert a value with two values and each one dimension',
    value: { 'en': 'hello', 'fr': 'bonjour' },
    expected: [
      { value: 'hello', dimensions: [{ dimCode: 'en' }] },
      { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] },
    ],
  },
  {
    title: 'should convert a basic value with multiple dimensions',
    value: { 'en,fr': 'hello' },
    expected: [
      { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: 'fr' }] },
    ],
  },
  {
    title: 'should convert a basic value with multiple dimensions',
    value: { 'en,*': 'hello', 'fr': 'bonjour' },
    expected: [
      { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: '*' }] },
      { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] },
    ],
  },
  {
    title: 'should convert a basic value with multiple dimensions and additional values',
    value: { 'en,*': 'hello', 'fr': 'bonjour', 'de': 'hallo' },
    expected: [
      { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: '*' }] },
      { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] },
      { value: 'hallo', dimensions: [{ dimCode: 'de' }] },
    ],
  },
];


interface EavFieldValueCreateEavValueTest<K extends EavTypeName> {
  title: string;
  input: { value: EavTypeMap[K]; type: K };
  expected: EavFieldValue<EavTypeMap[K]>[];
}

export const EavFieldValueCreateTests: EavFieldValueCreateEavValueTest<EavTypeName>[] = [
  {
    title: 'should wrap string value with wildcard dimension',
    input: { value: 'hello', type: 'String' },
    expected: [{ value: 'hello', dimensions: [{ dimCode: '*' }] }],
  },
  {
    title: 'should wrap number value with wildcard dimension',
    input: { value: 123, type: 'Number' },
    expected: [{ value: 123, dimensions: [{ dimCode: '*' }] }],
  },
  {
    title: 'should wrap boolean value with wildcard dimension',
    input: { value: true, type: 'Boolean' },
    expected: [{ value: true, dimensions: [{ dimCode: '*' }] }],
  },
  {
    title: 'should wrap object value with wildcard dimension',
    input: { value: { key: 'value' }, type: 'Object' },
    expected: [{ value: { key: 'value' }, dimensions: [{ dimCode: '*' }] }],
  },
];