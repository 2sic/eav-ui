import { EavFor } from '../../edit/shared/models/eav';

/**
 * Type for edit form.
 * To add new item send newItem and to edit existing item send editItems
 */
export interface EditForm {
  items: (ItemAddIdentifier | ItemEditIdentifier | ItemInListIdentifier)[];
}

export interface ItemIdentifierShared {

  /** Prefill form with data */
  Prefill?: Record<string, string>;

  Fields?: string;
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

  // Prefill?: Record<string, string>;
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
