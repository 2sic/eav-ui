import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../helpers/copy-to-clipboard.helper';

@Injectable({ providedIn: 'root' })
export class ClipboardService {

  constructor(private snackBar: MatSnackBar) { }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}