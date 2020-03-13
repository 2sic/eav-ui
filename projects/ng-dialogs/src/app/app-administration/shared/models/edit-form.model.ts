import { EavFor } from '../../../../../../edit/shared/models/eav';
import { EditDialogPersistedData } from '../../../../../../edit/shared/models/eav/edit-dialog-persisted-data';

/** Type for edit form. To add new item send newItem and to edit existing item send editItems */
export class EditForm {
  constructor(public items: (AddItem | EditItem)[], public persistedData: EditDialogPersistedData) { }
}

export class EditItem {
  constructor(public EntityId: string, public Title: string) { }
}

export class AddItem {
  /** Content type */
  ContentTypeName: string;
  /** Form title */
  Title?: string;
  /** Add item as metadata to another item */
  For?: EavFor;
  /** Prefill form with data */
  Prefill?: { [key: string]: string };
  /** Prefill form with data from another entity */
  DuplicateEntity?: number;
}
