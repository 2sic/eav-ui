import { DialogTypeConstants } from '../../constants/type-constants';
import { EditDialogPersistedData } from './admin-dialog-persisted-data';

export class AdminDialogData {
  constructor(public dialogType: DialogTypeConstants, public item: any, public persistedData: EditDialogPersistedData) { }
}
