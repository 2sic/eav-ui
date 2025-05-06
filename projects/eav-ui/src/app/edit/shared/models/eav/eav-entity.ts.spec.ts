import { EavEntity } from './eav-entity';
import { testAttributesDto, testAttributesInternal } from './eav-entity-attributes.ts.data.spec';
import { testEntityHeaderOnly2Dto, testEntityHeaderOnly2Internal, testEntityHeaderOnlyDto, testEntityHeaderOnlyInternal } from './eav-entity.ts.data.spec';



describe('EavEntity.convertOne(Headers)', () => {
  it('should convert a header only entity',
    () => expect(EavEntity.dtoToEav(testEntityHeaderOnlyDto))
      .toEqual(testEntityHeaderOnlyInternal));

  it('should convert a header only entity with null For/Metadata',
    () => expect(EavEntity.dtoToEav({ ...testEntityHeaderOnlyDto, For: null, Metadata: null }))
      .toEqual(testEntityHeaderOnlyInternal));

  it('should convert a header only entity with empty Metadata',
    () => expect(EavEntity.dtoToEav({ ...testEntityHeaderOnlyDto, Metadata: [] }))
      .toEqual({ ...testEntityHeaderOnlyInternal, Metadata: [] }));

});


describe('EavEntity.convertMany(Headers)', () => {
  it('should convert many with header only entities',
    () => expect(EavEntity.dtoToEavMany([testEntityHeaderOnlyDto, testEntityHeaderOnly2Dto]))
      .toEqual([testEntityHeaderOnlyInternal, testEntityHeaderOnly2Internal]));

});


describe('EavEntity.convertOne(Headers w/Metadata)', () => {
  it('should convert a header only entity with 1 metadata',
    () => expect(EavEntity.dtoToEav({...testEntityHeaderOnlyDto, Metadata: [testEntityHeaderOnly2Dto]}))
      .toEqual({...testEntityHeaderOnlyInternal, Metadata: [testEntityHeaderOnly2Internal]}));

  it('should convert a header only entity with 2 metadata',
    () => expect(EavEntity.dtoToEav({...testEntityHeaderOnlyDto, Metadata: [testEntityHeaderOnly2Dto, testEntityHeaderOnlyDto]}))
      .toEqual({...testEntityHeaderOnlyInternal, Metadata: [testEntityHeaderOnly2Internal, testEntityHeaderOnlyInternal]}));
});


describe('EavEntity.convertOne(Headers w/Attributes)', () => {
  it('should convert a header only entity',
    () => expect(EavEntity.dtoToEav({...testEntityHeaderOnlyDto, Attributes: testAttributesDto }))
      .toEqual({...testEntityHeaderOnlyInternal, Attributes: testAttributesInternal}));
});