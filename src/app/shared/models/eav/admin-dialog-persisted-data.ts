import { EavFor } from './index';

export class AdminDialogPersistedData {
    constructor(public metadataFor?: EavFor) {
        this.metadataFor = metadataFor;
    }
}
