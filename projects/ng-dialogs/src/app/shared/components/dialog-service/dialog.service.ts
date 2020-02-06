import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

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

/** Name of the closed dialog and data returned upon closing */
export class ClosedDialog {
  dialogName: string;
  data: ClosedDialogData;
}

/** Data returned in dialogClose() */
export class ClosedDialogData {
  result: any;
  toNotify: ClosedDialogNotify;
}

/** Tells which field in edit-ui opened child edit-ui to filter update when child closes */
export class ClosedDialogNotify {
  entityId: number;
  fieldName: string;
}
