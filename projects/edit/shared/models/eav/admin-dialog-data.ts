import { DialogTypeConstants } from '../../constants/type-constants';
import { AdminDialogPersistedData } from './index';

export class AdminDialogData {
  constructor(public dialogType: DialogTypeConstants, public item: any, public persistedData: AdminDialogPersistedData) { }
}
