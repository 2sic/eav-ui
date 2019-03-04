import { EavFor } from './index';

export class AdminDialogPersistedData {
    constructor(public isParentDialog?: boolean, public metadataFor?: EavFor) {
        this.isParentDialog = isParentDialog;
        this.metadataFor = metadataFor;
    }
}
