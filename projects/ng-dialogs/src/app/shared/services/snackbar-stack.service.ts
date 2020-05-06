import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';

/** This service ensures that multiple SnackBars are shown one after another. */
@Injectable({
  providedIn: 'root',
})
export class SnackbarStackService {
  private defaultDuration = 3000;
  private processingMessage = false;
  private messageQueue: SnackBarData[] = [];

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Add a message to the stack queue.
   * @returns will fire if the action is triggered
   */
  add(message: string, action?: string, config: MatSnackBarConfig<any> = { duration: this.defaultDuration }): Observable<boolean> {
    const triggered = new Subject<boolean>();
    this.messageQueue.push({ message, action, config, triggered });
    if (!this.processingMessage) {
      this.displaySnackbar();
    }
    return triggered;
  }

  private displaySnackbar(): void {
    const next = this.getNextMessage();

    if (!next) {
      this.processingMessage = false;
      return;
    }

    this.processingMessage = true;

    const snack = this.snackBar.open(next.message, next.action, next.config);
    snack.afterDismissed().subscribe(() => {
      this.displaySnackbar();
    });
    snack.onAction().subscribe(() => {
      next.triggered.next(true);
      next.triggered.complete();
    });
  }

  private getNextMessage(): SnackBarData | undefined {
    return this.messageQueue.length ? this.messageQueue.shift() : undefined;
  }
}

class SnackBarData {
  message: string;
  action: string;
  config: MatSnackBarConfig<any>;
  triggered: Subject<boolean>;
}
