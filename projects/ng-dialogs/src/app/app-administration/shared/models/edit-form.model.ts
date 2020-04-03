import { EavFor } from '../../../../../../edit/shared/models/eav';

/** Type for edit form. To add new item send newItem and to edit existing item send editItems */
export class EditForm {
  constructor(public items: (AddItem | EditItem | GroupItem)[]) { }
}

export class EditItem {
  constructor(public EntityId: string) { }
}

export class AddItem {
  /** Content type */
  ContentTypeName: string;
  /** Add item as metadata to another item */
  For?: EavFor;
  /** Prefill form with data */
  Prefill?: { [key: string]: string };
  /** Prefill form with data from another entity */
  DuplicateEntity?: number;
}

export class GroupItem {
  Group: GroupItemGroup;
}

export class GroupItemGroup {
  Guid: string;
  Index: number;
  Part: string;
  Add: boolean;
}
