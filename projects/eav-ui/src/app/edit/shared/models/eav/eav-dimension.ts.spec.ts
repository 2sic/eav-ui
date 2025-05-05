import { EavDimension } from './eav-dimension';

describe('EavDimension.Create', () => {
  it('should create a basic dimension',
    () => expect(EavDimension.create("en"))
      .toEqual({ Value: "en" }));

  it('should create a * dimension',
    () => expect(EavDimension.create("*"))
      .toEqual({ Value: "*" }));

});
