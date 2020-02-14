import { ClosedDialogNotify } from '../../../../ng-dialogs/src/app/shared/models/closed-dialog.model';

export class EditDialogPersistedData {
  constructor(public toNotify?: ClosedDialogNotify, public expandedFieldId?: number) { }
}
