import { EavFor } from '../../../../../edit/shared/models/eav';
import { ObjectModel } from './object.model';

/** Type for edit form. To add new item send newItem and to edit existing item send editItems */
export class EditForm {
  constructor(public items: (AddItem | EditItem | GroupItem | InnerItem | SourceItem)[]) { }
}

export class EditItem {
  constructor(public EntityId: number) { }
}

export class AddItem {
  /** Content type */
  ContentTypeName: string;
  /** Add item as metadata to another item */
  For?: EavFor;
  /** @deprecated 2sxc 9 Metadata object */
  Metadata?: LegacyMetadata;
  /** Prefill form with data */
  Prefill?: ObjectModel<string>;
  /** Prefill form with data from another entity */
  DuplicateEntity?: number;
}

export class GroupItem {
  Group: GroupItemGroup;
  Prefill?: ObjectModel<string>;
}

export class GroupItemGroup {
  Guid: string;
  Index: number;
  Part: string;
  Add: boolean;
}

export class InnerItem {
  Add: boolean;
  EntityId: number;
  Field: string;
  Index: number;
  Parent: string;
  Prefill?: ObjectModel<string>;
}

export class SourceItem {
  constructor(public Path: string) { }
}

/** @deprecated 2sxc 9 Metadata object */
export class LegacyMetadata {
  key: string;
  keyType: string;
  targetType: number;
}
