import { EavFor } from './index';
import { ClosedDialogNotify } from '../../../../ng-dialogs/src/app/shared/components/dialog-service/dialog.service';

export class AdminDialogPersistedData {
  constructor(public isParentDialog: boolean, public metadataFor?: EavFor, public toNotify?: ClosedDialogNotify) { }
}
