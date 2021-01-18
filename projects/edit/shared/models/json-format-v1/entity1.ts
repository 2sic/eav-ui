import { EavEntity, EavFor } from '../eav';
import { Attributes1 } from './attributes1';
import { Type1 } from './type1';

export class Entity1 {
  Id: number;
  Version: number;
  Guid: string;
  Type: Type1;
  Attributes: Attributes1<any>;
  Owner: string;
  Metadata: Entity1[];
  For?: EavFor;

  constructor(
    Id: number,
    Version: number,
    Guid: string,
    Type: Type1,
    Attributes: Attributes1<any>,
    Owner: string,
    Metadata: Entity1[],
    For?: EavFor,
  ) {
    this.Id = Id;
    this.Version = Version;
    this.Guid = Guid;
    this.Type = Type;
    this.Attributes = Attributes;
    this.Owner = Owner;
    this.Metadata = Metadata;
    this.For = For;
  }

  public static create(entity: EavEntity): Entity1 {
    const attributes1 = Attributes1.create(entity.attributes);
    const metaData1 = this.createArray(entity.metadata);

    return new Entity1(
      entity.id,
      entity.version,
      entity.guid,
      new Type1(entity.type.id, entity.type.name),
      attributes1,
      entity.owner,
      metaData1,
      entity.For,
    );
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
