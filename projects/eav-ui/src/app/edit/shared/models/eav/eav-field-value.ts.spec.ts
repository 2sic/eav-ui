import { EavDimension } from './eav-dimension';
import { EavFieldValue } from './eav-field-value';

interface EavFieldValueTestCreate {
  title: string;
  value: string;
  dimensions: EavDimension[];
  expected: EavFieldValue<string>;
}

const EavFieldValueCreateTests: EavFieldValueTestCreate[] = [
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

describe('EavValue.Create', () => {
  EavFieldValueCreateTests.forEach(({ title, value, dimensions, expected }) => {
    it(title, () => expect(EavFieldValue.create(value, dimensions)).toEqual(expected));
  });
});

interface EavFieldValueTestConvert {
  title: string;
  value: Record<string, string>;
  expected: EavFieldValue<string>[];
}

const EavFieldValueConvertTests: EavFieldValueTestConvert[] = [
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



describe('EavValue.Convert', () => {
  EavFieldValueConvertTests.forEach(({ title, value, expected }) => {
    it(title, () => expect(EavFieldValue.dtoToEav(value)).toEqual(expected));
  });
});
