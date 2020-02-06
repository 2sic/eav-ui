import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class DialogService {
  private dialogClosed: Subject<string> = new Subject();

  constructor() { }

  subToClosed(dialogs: string[], parent?: SubToClosedParent) {
    return <Observable<string>>this.dialogClosed.pipe(
      filter(closedDialog => {
        if (!parent) {
          return dialogs.includes(closedDialog);
        } else {
          return dialogs
            .map(dialog => `${dialog}-${parent.entityId}-${parent.fieldName}`)
            .includes(closedDialog);
        }
      }),
    );
  }

  fireClosed(dialog: string, parent?: SubToClosedParent) {
    let dialogName = dialog;
    if (parent) { dialogName = `${dialog}-${parent.entityId}-${parent.fieldName}`; }
    console.log('Dialog was closed:', dialogName);
    this.dialogClosed.next(dialogName);
  }
}

/** Tells which field in edit-ui opened child edit-ui to filter update when child closes */
export class SubToClosedParent {
  entityId: number;
  fieldName: string;
}
