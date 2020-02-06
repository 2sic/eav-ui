import { EavFor } from './index';
import { ClosedDialogNotify } from '../../../../ng-dialogs/src/app/shared/models/closed-dialog.model';

export class EditDialogPersistedData {
  constructor(public isParentDialog: boolean, public metadataFor?: EavFor, public toNotify?: ClosedDialogNotify) { }
}
