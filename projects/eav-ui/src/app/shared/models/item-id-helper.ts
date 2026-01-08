import { Of } from 'projects/core';
import { MetadataInfo } from '../../content-items/create-metadata-dialog/create-metadata-dialog.models';
import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants, MetadataKeyDefinition, MetadataKeyTypes } from '../constants/eav.constants';
import { ItemAddIdentifier, ItemEditIdentifier, ItemInListIdentifier } from './edit-form.model';

// 2dm - new helper to reduce code when creating item identifiers

export class ItemIdHelper {

  static editId(id: number): ItemEditIdentifier {
    return { EntityId: id } satisfies ItemEditIdentifier;
  }

  /**
   * Get the item identifier for adding a new item of the specified content type
   * @param contentType
   * @param prefill
   * @returns
   */
  static newFromType(contentType: string, prefill?: Record<string, unknown>): ItemAddIdentifier {
    return {
      ContentTypeName: contentType,
      ...(prefill && { Prefill: prefill })
    } satisfies ItemAddIdentifier;
  }

  /**
   * Get the item identifier to add/edit a json-based item of the specified content type
   * @param contentType
   * @param prefill
   * @returns
   */
  static newJsonFromType(contentType: string, prefill?: Record<string, unknown>): ItemAddIdentifier {
    const basics = {
      ...this.newFromType(contentType, prefill),
      ClientData: {
        save: 'js',
        duplicate: true,
      }
    } as ItemAddIdentifier;
    return basics;
  }

  static newMetadataFromInfo(contentTypeName: string, itemFor: MetadataInfo): ItemAddIdentifier {
    return {
      ContentTypeName: contentTypeName,
      For: {
        Target: itemFor.target ?? itemFor.targetType.toString(),
        TargetType: itemFor.targetType,
        ...(itemFor.keyType === eavConstants.keyTypes.guid && { Guid: itemFor.key }),
        ...(itemFor.keyType === eavConstants.keyTypes.number && { Number: parseInt(itemFor.key, 10) }),
        ...(itemFor.keyType === eavConstants.keyTypes.string && { String: itemFor.key }),
      },
    };
  }

  static newMetadata<T>(key: T, typeName: string, keyDef: MetadataKeyDefinition, singleton?: boolean): ItemAddIdentifier {
    return {
      ContentTypeName: typeName,
      For: ItemIdHelper.createFor(keyDef, key, singleton),
    } satisfies ItemAddIdentifier;
  }

  static createFor<T>(keyDef: MetadataKeyDefinition, key: T, singleton?: boolean): EavFor {
    return {
      Target: keyDef.target,
      TargetType: keyDef.targetType,
      ...(
        typeof (key) == 'number'
          ? { Number: key as number }
          : keyDef.keyType == 'guid'
            ? { Guid: key as string }
            : { String: key as string }
      ),
      ...(singleton && { Singleton: true })
    } satisfies EavFor;
  }

  static constructMetadataInfo(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string): MetadataInfo {
    const specs = Object.values(eavConstants.metadata).find(m => m.targetType === targetType);
    return {
      target: specs?.target ?? targetType.toString(),
      targetType: targetType,
      key: key,
      keyType: keyType,
    } satisfies MetadataInfo;
  }

  static relationship(parent: string, field: string, index: number = 0, add: boolean = null): ItemInListIdentifier {
    return {
      Parent: parent,
      Field: field,
      Index: index,
      Add: add,
    } satisfies ItemInListIdentifier;
  }

  static copy(contentType: string, id: number): ItemAddIdentifier {
    return {
      ContentTypeName: contentType,
      DuplicateEntity: id,
    } satisfies ItemAddIdentifier;
  }
}
