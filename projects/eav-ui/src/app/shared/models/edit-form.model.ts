import { MetadataInfo } from '../../content-items/create-metadata-dialog/create-metadata-dialog.models';
import { EavFor } from '../../edit/shared/models/eav';
import { eavConstants, MetadataKeyDefinition, MetadataKeyType } from '../constants/eav.constants';
import { EditInfo } from './edit-info';

// 2dm - new helper to reduce code when creating item identifiers
// TODO: @2dg - try to replace as many direct object creations with this as possible
export class EditPrep {

  static editId(id: number): ItemEditIdentifier {
    return { EntityId: id } satisfies ItemEditIdentifier;
  }

  static newFromType(contentType: string, prefill?: Record<string, unknown>): ItemAddIdentifier {
    return {
      ContentTypeName: contentType,
      ...(prefill && { Prefill: prefill })
    } satisfies ItemAddIdentifier;
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
    }
  }

  // TODO: @2dg - TO FIND where this should be used, look for "For:" in the code
  static newMetadata<T>(key: T, typeName: string, keyDef: MetadataKeyDefinition, singleton?: boolean): ItemAddIdentifier {
    return {
      ContentTypeName: typeName,
      For: EditPrep.createFor(keyDef, key, singleton),
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

  static constructMetadataInfo(targetType: number, keyType: MetadataKeyType, key: string): MetadataInfo {
    const specs = Object.values(eavConstants.metadata).find(m => m.targetType === targetType);
    return {
      target: specs?.target ?? targetType.toString(),
      targetType: targetType,
      key: key,
      keyType: keyType,
    } satisfies MetadataInfo;
  }

  static relationship(parent: string, field: string, index: number = 0, add: boolean = null) :ItemInListIdentifier {
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

/**
 * Type for edit form.
 * To add new item send newItem and to edit existing item send editItems
 */
export interface EditForm {
  items: (ItemIdentifier)[];
}

export type ItemIdentifier = ItemAddIdentifier | ItemEditIdentifier | ItemInListIdentifier;

export type ItemIdentifierHeader = ItemIdentifier & ItemIdentifierEditConfig;

// TODO: leave these comments in till we've checked the backend to ensure we've removed
// TODO: unused properties
// export interface ItemIdentifierHeader extends ItemIdentifierShared, ItemIdentifierEditConfig {
//   // 2023-05-15 seems unused - TODO: probably remove from backend as well
//   // Add?: boolean;
//   ContentTypeName: string;
//   DuplicateEntity?: number;
//   EntityId: number;
//   // 2023-05-15 seems unused - TODO: probably remove from backend as well
//   // For?: EavFor;
//   // 2023-05-15 seems unused - TODO: probably remove from backend as well
//   // Guid: string;
//   // 2023-05-15 seems unused - TODO: probably remove from backend as well
//   // Index?: number;

//   // 2023-05-15 seems unused
//   // Metadata?: EavEntity[];
//   // 2023-05-15 now in base interface
//   // Prefill?: Record<string, any>;

//   // 2023-05-15 seems unused - TODO: probably remove from backend as well
//   // Title?: string;
// }

export interface ItemIdentifierInbound {
  /** inbound fields, coming from the toolbar */
  UiFields?: string;
  Parameters?: Record<string, unknown>;
}

export interface ItemIdentifierShared {

  /** Prefill form with data */
  Prefill?: Record<string, unknown>;

  /**
   * New way to transport a random amount of properties back and forth
   * - IMPORTANT: this is only after conversion to funky url
   * - before you must use Parameters on the main object?
   */
  ClientData?: {
    fields?: string;
    parameters?: Record<string, unknown>;
    [key: string]: unknown;
  };

  /** Experimental 17.10+ */
  clientId?: number;
}

export interface ItemEditIdentifier extends ItemIdentifierShared {
  EntityId: number;
}

export interface ItemAddIdentifier extends ItemIdentifierShared {
  /** Content type */
  ContentTypeName: string;
  /** Add item as metadata to another item */
  For?: EavFor;
  /** @deprecated 2sxc 9 Metadata object */
  Metadata?: LegacyMetadata;

  /** Prefill form with data from another entity */
  DuplicateEntity?: number;
}

/**
 * This is both an item in a content-group, as well as an item in a list
 */
export interface ItemInListIdentifier extends ItemIdentifierShared {
  Add: boolean;
  Index: number;
  Parent: string;
  Field: string;

  EntityId?: number;
}

export interface ViewOrFileIdentifier {
  Edition?: string;
  EntityId?: number;
  IsShared: boolean;
  Path: string;
}

/** @deprecated 2sxc 9 Metadata object */
export interface LegacyMetadata {
  key: string;
  keyType: string;
  targetType: number;
}


export interface ItemIdentifierEditConfig {
  /** Information if this item is read-only */
  EditInfo?: EditInfo;
  /** Determines if this item is currently non-existing / empty - so if this doesn't change it should also save empty */
  IsEmpty: boolean;
  /** Determines if this item can be empty, so it is allowed to be removed */
  IsEmptyAllowed: boolean;
}
