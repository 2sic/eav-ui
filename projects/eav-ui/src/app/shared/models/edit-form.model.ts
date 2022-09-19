import { EavFor } from '../../edit/shared/models/eav';

/** Type for edit form. To add new item send newItem and to edit existing item send editItems */
export interface EditForm {
  items: (AddItem | EditItem | GroupItem | InnerItem | SourceItem)[];
}

export interface EditItem {
  EntityId: number;
}

export interface AddItem {
  /** Content type */
  ContentTypeName: string;
  /** Add item as metadata to another item */
  For?: EavFor;
  /** @deprecated 2sxc 9 Metadata object */
  Metadata?: LegacyMetadata;
  /** Prefill form with data */
  Prefill?: Record<string, string>;
  /** Prefill form with data from another entity */
  DuplicateEntity?: number;
}

export interface GroupItem {
  // 2022-09-19 2dm - WIP, part of #cleanUpDuplicateGroupHeaders
  Add: boolean;
  Index: number;
  Parent: string;
  Field: string;

  Group: GroupItemGroup;
  Prefill?: Record<string, string>;
}

export interface GroupItemGroup {
  Guid: string;
  // Index: number;
  Part: string;
  // 2022-09-19 2dm - WIP, part of #cleanUpDuplicateGroupHeaders
  // trying to remove
  // Add: boolean;
}

export interface InnerItem {
  Add: boolean;
  EntityId: number;
  Field: string;
  Index: number;
  Parent: string;
  Prefill?: Record<string, string>;
}

export interface SourceItem {
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
