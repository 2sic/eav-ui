import { EavDimension } from './eav-dimension';
import { EavFieldValue } from './eav-field-value';

describe('EavValue.Create', () => {
  it('should create a basic value without dimensions',
    () => expect(EavFieldValue.create('hello', []))
      .toEqual({ Value: 'hello', Dimensions: [] }));

  it('should create a basic value with a single dimension',
    () => expect(EavFieldValue.create('hello', [EavDimension.create('en')]))
      .toEqual({ Value: 'hello', Dimensions: [{ Value: 'en' }] }));

  it('should create a basic value with multiple dimensions',
    () => expect(EavFieldValue.create('hello', [EavDimension.create('en'), EavDimension.create('fr')]))
      .toEqual({ Value: 'hello', Dimensions: [{ Value: 'en' }, { Value: 'fr' }] }));

});


describe('EavValue.Convert', () => {
  it('should convert a basic value with one dimension',
    () => expect(EavFieldValue.convert({ 'en': 'hello' }))
      .toEqual([{ Value: 'hello', Dimensions: [{ Value: 'en' }] }]));

  it('should convert a value with two values and each one dimension',
    () => expect(EavFieldValue.convert({ 'en': 'hello', 'fr': 'bonjour' }))
      .toEqual([
        { Value: 'hello', Dimensions: [{ Value: 'en' }] },
        { Value: 'bonjour', Dimensions: [{ Value: 'fr' }] },
      ]));

  it('should convert a basic value with multiple dimensions',
    () => expect(EavFieldValue.convert({ 'en,fr': 'hello' }))
      .toEqual([
        { Value: 'hello', Dimensions: [{ Value: 'en' }, { Value: 'fr' }] },
      ]));
  it('should convert a basic value with multiple dimensions',
    () => expect(EavFieldValue.convert({ 'en,*': 'hello', 'fr': 'bonjour' }))
      .toEqual([
        { Value: 'hello', Dimensions: [{ Value: 'en' }, { Value: '*' }] },
        { Value: 'bonjour', Dimensions: [{ Value: 'fr' }] },
      ]));
  it('should convert a basic value with multiple dimensions and additional values',
    () => expect(EavFieldValue.convert({ 'en,*': 'hello', 'fr': 'bonjour', 'de': 'hallo' }))
      .toEqual([
        { Value: 'hello', Dimensions: [{ Value: 'en' }, { Value: '*' }] },
        { Value: 'bonjour', Dimensions: [{ Value: 'fr' }] },
        { Value: 'hallo', Dimensions: [{ Value: 'de' }] },
      ]));

});
