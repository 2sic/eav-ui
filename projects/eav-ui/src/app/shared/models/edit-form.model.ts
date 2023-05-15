import { EavFor } from '../../edit/shared/models/eav';
import { EditInfo } from './edit-info';

/**
 * Type for edit form.
 * To add new item send newItem and to edit existing item send editItems
 */
export interface EditForm {
  items: (ItemIdentifier)[];
}

export type ItemIdentifier = ItemAddIdentifier | ItemEditIdentifier | ItemInListIdentifier;

export type ItemIdentifierHeader = ItemIdentifier & ItemIdentifierEditConfig;

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


export interface ItemIdentifierShared {

  /** Prefill form with data */
  Prefill?: Record<string, string>;

  /** New way to transport a random amount of properties back and forth */
  ClientData?: {
    fields?: string;
    parameters?: Record<string, string>;
    [key: string]: unknown;
  };
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