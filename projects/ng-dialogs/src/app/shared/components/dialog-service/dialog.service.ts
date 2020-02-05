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
            .map(dialog => `${dialog}-${parent.formId}-${parent.entityId}-${parent.fieldName}`)
            .includes(closedDialog);
        }
      }),
    );
  }

  fireClosed(dialog: string, parent?: SubToClosedParent) {
    if (!parent) {
      this.dialogClosed.next(dialog);
    } else {
      this.dialogClosed.next(`${dialog}-${parent.formId}-${parent.entityId}-${parent.fieldName}`);
    }
  }
}

/** Tells which field in edit-ui opened child edit-ui to filter update when child closes */
export class SubToClosedParent {
  formId: number;
  entityId: number;
  fieldName: string;
}
