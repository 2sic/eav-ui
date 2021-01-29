import { EntityAttributes1 } from '.';
import { EavEntity, EavFor, EavType } from '../eav';

export class Entity1 {
  public Attributes: EntityAttributes1;
  public Guid: string;
  public Id: number;
  public Owner: string;
  public Type: EavType;
  public Version: number;
  public For?: EavFor;
  public Metadata?: Entity1[];

  public static convertOne(entity: EavEntity): Entity1 {
    const attributes1 = EntityAttributes1.convert(entity.Attributes);
    const metadata1 = this.convertMany(entity.Metadata);

    const entity1: Entity1 = {
      Attributes: attributes1,
      Guid: entity.Guid,
      Id: entity.Id,
      Owner: entity.Owner,
      Type: entity.Type,
      Version: entity.Version,
      For: entity.For,
      Metadata: metadata1,
    };
    return entity1;
  }

  private static convertMany(entities: EavEntity[]): Entity1[] {
    if (entities == null) { return null; }

    const entities1 = entities.map(entity => Entity1.convertOne(entity));
    return entities1;
  }
}
