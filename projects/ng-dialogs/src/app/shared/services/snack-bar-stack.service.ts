import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

/** This service ensures that multiple SnackBars are shown one after another. */
@Injectable({ providedIn: 'root' })
export class SnackBarStackService implements OnDestroy {
  private defaultDuration = 3000;
  private processingMessage = false;
  private messageQueue: SnackBarData[] = [];

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Add a message to the stack queue.
   * @returns observable that fires if the action is triggered.
   * Service will complete the observable
   */
  add(message: string, action?: string, config: MatSnackBarConfig = { duration: this.defaultDuration }) {
    const triggered$ = new Subject<void>();
    this.messageQueue.push({ message, action, config, triggered$ });
    if (!this.processingMessage) {
      this.showSnackBar();
    }
    return triggered$.asObservable();
  }

  private showSnackBar() {
    const nextMsg = this.messageQueue.shift();

    if (nextMsg == null) {
      this.processingMessage = false;
      return;
    }

    this.processingMessage = true;

    const snackBarRef = this.snackBar.open(nextMsg.message, nextMsg.action, nextMsg.config);
    snackBarRef.afterDismissed().subscribe(() => {
      nextMsg.triggered$.complete();
      this.showSnackBar();
    });
    snackBarRef.onAction().subscribe(() => {
      nextMsg.triggered$.next();
    });
  }

  // spm TODO: ngOnDestroy only fires in services provided in component
  ngOnDestroy() {
    for (const message of this.messageQueue) {
      message.triggered$.complete();
    }
    this.messageQueue = null;
  }
}

class SnackBarData {
  message: string;
  action: string;
  config: MatSnackBarConfig;
  triggered$: Subject<void>;
}
