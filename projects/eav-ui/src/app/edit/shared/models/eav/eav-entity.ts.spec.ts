import { EavEntity } from './eav-entity';
import { testAttributesDto, testAttributesInternal } from './eav-entity-attributes.ts.data.spec';
import { testEntityHeaderOnly2Dto, testEntityHeaderOnly2Eav, testEntityHeaderOnlyDto, testEntityHeaderOnlyEav } from './eav-entity.ts.data.spec';



describe('EavEntity.convertOne(Headers)', () => {
  it('should convert a header only entity',
    () => expect(EavEntity.dtoToEav(testEntityHeaderOnlyDto))
      .toEqual(testEntityHeaderOnlyEav));

  it('should convert a header only entity with null For/Metadata',
    () => expect(EavEntity.dtoToEav({ ...testEntityHeaderOnlyDto, For: null, Metadata: null }))
      .toEqual(testEntityHeaderOnlyEav));

  it('should convert a header only entity with empty Metadata',
    () => expect(EavEntity.dtoToEav({ ...testEntityHeaderOnlyDto, Metadata: [] }))
      .toEqual({ ...testEntityHeaderOnlyEav, Metadata: [] }));

});


describe('EavEntity.convertMany(Headers)', () => {
  it('should convert many with header only entities',
    () => expect(EavEntity.dtoToEavMany([testEntityHeaderOnlyDto, testEntityHeaderOnly2Dto]))
      .toEqual([testEntityHeaderOnlyEav, testEntityHeaderOnly2Eav]));

});


describe('EavEntity.convertOne(Headers w/Metadata)', () => {
  it('should convert a header only entity with 1 metadata',
    () => expect(EavEntity.dtoToEav({...testEntityHeaderOnlyDto, Metadata: [testEntityHeaderOnly2Dto]}))
      .toEqual({...testEntityHeaderOnlyEav, Metadata: [testEntityHeaderOnly2Eav]}));

  it('should convert a header only entity with 2 metadata',
    () => expect(EavEntity.dtoToEav({...testEntityHeaderOnlyDto, Metadata: [testEntityHeaderOnly2Dto, testEntityHeaderOnlyDto]}))
      .toEqual({...testEntityHeaderOnlyEav, Metadata: [testEntityHeaderOnly2Eav, testEntityHeaderOnlyEav]}));
});


describe('EavEntity.convertOne(Headers w/Attributes)', () => {
  it('should convert a header only entity',
    () => expect(EavEntity.dtoToEav({...testEntityHeaderOnlyDto, Attributes: testAttributesDto }))
      .toEqual({...testEntityHeaderOnlyEav, Attributes: testAttributesInternal}));
});