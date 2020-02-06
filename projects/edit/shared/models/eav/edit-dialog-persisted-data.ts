import { ClosedDialogNotify } from '../../../../ng-dialogs/src/app/shared/models/closed-dialog.model';

export class EditDialogPersistedData {
  constructor(public isParentDialog: boolean, public toNotify?: ClosedDialogNotify) { }
}
