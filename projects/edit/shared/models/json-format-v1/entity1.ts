import { Attributes1 } from '.';
import { EavEntity, EavFor, EavType } from '../eav';

export class Entity1 {
  constructor(
    public Attributes: Attributes1,
    public Guid: string,
    public Id: number,
    public Owner: string,
    public Type: EavType,
    public Version: number,
    public For?: EavFor,
    public Metadata?: Entity1[],
  ) { }

  public static create(entity: EavEntity): Entity1 {
    const attributes1 = Attributes1.convert(entity.Attributes);
    const metaData1 = this.createArray(entity.Metadata);

    return new Entity1(attributes1, entity.Guid, entity.Id, entity.Owner, entity.Type, entity.Version, entity.For, metaData1);
  }

  public static createArray(eavEntityArray: EavEntity[]): Entity1[] {
    if (!eavEntityArray) { return null; }
    const metaData1Array: Entity1[] = new Array<Entity1>();
    eavEntityArray.forEach(eavEntity => {
      metaData1Array.push(Entity1.create(eavEntity));
    });
    return metaData1Array;
  }
}
