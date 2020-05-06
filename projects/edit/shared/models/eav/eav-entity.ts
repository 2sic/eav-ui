import { EavAttributes } from './eav-attributes';
import { EavType } from './eav-type';
import { Entity1 } from '../json-format-v1/entity1';
import { EavFor } from './eav-for';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

export class EavEntity {
  id: number;
  version: number;
  guid: string;
  type: EavType;
  attributes: EavAttributes;
  owner: string;
  metadata: EavEntity[];
  For?: EavFor;

  constructor(
    id: number,
    version: number,
    guid: string,
    type: EavType,
    attributes: EavAttributes,
    owner: string,
    metadata: EavEntity[],
    For?: EavFor,
  ) {
    this.id = id;
    this.version = version;
    this.guid = guid;
    this.type = type;
    this.attributes = attributes;
    this.owner = owner;
    this.metadata = metadata;
    if (For) { this.For = For; }
  }

  /** Create new Eav Entity from typed json Entity1 */
  public static create(item: Entity1): EavEntity {
    if (!item) {
      return new EavEntity(0, 1, '00000000-0000-0000-0000-000000000000', null, new EavAttributes(), '', null);
    }
    const eavAttributes = EavAttributes.create(item.Attributes);
    const eavMetaData = this.createArray(item.Metadata);
    const eavFor: EavFor = item.For ? new EavFor(item.For) : null;

    return new EavEntity(
      item.Id,
      item.Version,
      item.Guid,
      new EavType(item.Type.Id, item.Type.Name),
      eavAttributes,
      item.Owner,
      eavMetaData,
      eavFor
    );
  }

  /** Create new MetaData Entity Array from json typed metadataArray Entity1[] */
  public static createArray(entity1Array: Entity1[]): EavEntity[] {
    if (!entity1Array) { return null; }
    const eavMetaDataArray: EavEntity[] = new Array<EavEntity>();
    angularConsoleLog('entity1Array:', entity1Array);
    try {
      entity1Array.forEach(entity1 => {
        eavMetaDataArray.push(EavEntity.create(entity1));
      });
    } catch (error) {
      console.error('Metadata failed to be build. Error:', error);
    }
    return eavMetaDataArray;
  }
}
