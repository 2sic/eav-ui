import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ClosedDialog, ClosedDialogNotify, ClosedDialogData } from '../../models/closed-dialog.model';

@Injectable()
export class DialogService {
  private closedDialog: Subject<ClosedDialog> = new Subject();

  constructor() { }

  subToClosed(dialogs: string[], toNotify?: ClosedDialogNotify) {
    return <Observable<ClosedDialog>>this.closedDialog.pipe(
      filter(closedDialog => {
        if (!toNotify) {
          return dialogs.includes(closedDialog.dialogName);
        } else if (!closedDialog.data.toNotify) {
          return false;
        } else {
          return (
            toNotify.entityId === closedDialog.data.toNotify.entityId &&
            toNotify.fieldName === closedDialog.data.toNotify.fieldName &&
            dialogs.includes(closedDialog.dialogName)
          );
        }
      }),
    );
  }

  fireClosed(dialogName: string, data: ClosedDialogData) {
    const closedDialog: ClosedDialog = {
      dialogName: dialogName,
      data: data,
    };
    console.log('Dialog was closed:', closedDialog);
    this.closedDialog.next(closedDialog);
  }
}
