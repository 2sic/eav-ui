import { AdminDialogPersistedData } from '../../../../../../edit/shared/models/eav';

export class EditForm {
  constructor(public editItems: EditItem[], public persistedData: AdminDialogPersistedData) { }
}

export class EditItem {
  constructor(public EntityId: string, public Title: string) { }
}
