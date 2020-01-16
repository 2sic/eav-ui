import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class DialogService {
  private dialogClosed: Subject<string> = new Subject();

  constructor() { }

  subToClosed(dialogs: string[]) {
    return <Observable<string>>this.dialogClosed.pipe(filter(closedDialog => dialogs.includes(closedDialog)));
  }

  fireClosed(dialog: string) {
    this.dialogClosed.next(dialog);
  }

}
