import { EavDimension } from './eav-dimension';
import { EavFieldValue } from './eav-field-value';

describe('EavValue.Create', () => {
  it('should create a basic value without dimensions',
    () => expect(EavFieldValue.create('hello', []))
      .toEqual({ value: 'hello', dimensions: [] }));

  it('should create a basic value with a single dimension',
    () => expect(EavFieldValue.create('hello', [EavDimension.create('en')]))
      .toEqual({ value: 'hello', dimensions: [{ dimCode: 'en' }] }));

  it('should create a basic value with multiple dimensions',
    () => expect(EavFieldValue.create('hello', [EavDimension.create('en'), EavDimension.create('fr')]))
      .toEqual({ value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: 'fr' }] }));

});


describe('EavValue.Convert', () => {
  it('should convert a basic value with one dimension',
    () => expect(EavFieldValue.convert({ 'en': 'hello' }))
      .toEqual([{ value: 'hello', dimensions: [{ dimCode: 'en' }] }]));

  it('should convert a value with two values and each one dimension',
    () => expect(EavFieldValue.convert({ 'en': 'hello', 'fr': 'bonjour' }))
      .toEqual([
        { value: 'hello', dimensions: [{ dimCode: 'en' }] },
        { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] },
      ]));

  it('should convert a basic value with multiple dimensions',
    () => expect(EavFieldValue.convert({ 'en,fr': 'hello' }))
      .toEqual([
        { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: 'fr' }] },
      ]));
  it('should convert a basic value with multiple dimensions',
    () => expect(EavFieldValue.convert({ 'en,*': 'hello', 'fr': 'bonjour' }))
      .toEqual([
        { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: '*' }] },
        { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] },
      ]));
  it('should convert a basic value with multiple dimensions and additional values',
    () => expect(EavFieldValue.convert({ 'en,*': 'hello', 'fr': 'bonjour', 'de': 'hallo' }))
      .toEqual([
        { value: 'hello', dimensions: [{ dimCode: 'en' }, { dimCode: '*' }] },
        { value: 'bonjour', dimensions: [{ dimCode: 'fr' }] },
        { value: 'hallo', dimensions: [{ dimCode: 'de' }] },
      ]));

});
