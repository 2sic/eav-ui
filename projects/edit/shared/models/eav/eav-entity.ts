import { EavAttributes, EavFor, EavType } from '.';
import { Entity1 } from '../json-format-v1';

export class EavEntity {
  constructor(
    public Attributes: EavAttributes,
    public Guid: string,
    public Id: number,
    public Owner: string,
    public Type: EavType,
    public Version: number,
    public For?: EavFor,
    public Metadata?: EavEntity[],
  ) { }

  public static create(item: Entity1): EavEntity {
    if (!item) {
      return new EavEntity({}, '00000000-0000-0000-0000-000000000000', 0, '', null, 1, null, null);
    }
    const eavAttributes = EavAttributes.convert(item.Attributes);
    const eavMetaData = this.createArray(item.Metadata);

    return new EavEntity(
      eavAttributes,
      item.Guid,
      item.Id,
      item.Owner,
      item.Type,
      item.Version,
      item.For,
      eavMetaData,
    );
  }

  public static createArray(entity1Array: Entity1[]): EavEntity[] {
    if (!entity1Array) { return null; }
    const eavMetaDataArray: EavEntity[] = new Array<EavEntity>();
    entity1Array.forEach(entity1 => {
      eavMetaDataArray.push(EavEntity.create(entity1));
    });
    return eavMetaDataArray;
  }
}
