import { EavFor } from '../../../../../../edit/shared/models/eav';
import { EditDialogPersistedData } from '../../../../../../edit/shared/models/eav/edit-dialog-persisted-data';

/** Type for edit form. To add new item send newItem and to edit existing item send editItems */
export class EditForm {
  constructor(public addItems: AddItem[], public editItems: EditItem[], public persistedData: EditDialogPersistedData) { }
}

export class EditItem {
  constructor(public EntityId: string, public Title: string) { }
}

export class AddItem {
  /** Content type */
  ContentTypeName: string;
  /** Add item as metadata to another item */
  For?: EavFor;
}
