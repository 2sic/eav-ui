import { DialogTypeConstants } from '../../constants/type-constants';

export class AdminDialogData {
    constructor(public dialogType: DialogTypeConstants, public item: any) {
        this.dialogType = dialogType;
        this.item = item;
    }
}
