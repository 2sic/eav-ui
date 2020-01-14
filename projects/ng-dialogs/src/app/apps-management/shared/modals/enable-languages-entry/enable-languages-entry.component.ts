import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EnableLanguagesComponent } from '../enable-languages/enable-languages.component';
import { ENABLE_LANGUAGES_DIALOG_CLOSED } from '../../constants/navigation-messages';

@Component({
  selector: 'app-enable-languages-entry',
  templateUrl: './enable-languages-entry.component.html',
  styleUrls: ['./enable-languages-entry.component.scss']
})
export class EnableLanguagesEntryComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private dialogRef: MatDialogRef<EnableLanguagesComponent, any>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    console.log('Open import app dialog');
    this.dialogRef = this.dialog.open(EnableLanguagesComponent, {
      backdropClass: 'enable-languages-dialog-backdrop',
      panelClass: ['enable-languages-dialog-panel', 'dialog-panel-medium'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscription.add(
      this.dialogRef.afterClosed().subscribe(() => {
        console.log('Enable Languages dialog was closed.');
        this.router.navigate(['../'], {
          relativeTo: this.route,
          state: {
            message: ENABLE_LANGUAGES_DIALOG_CLOSED,
          }
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
    this.dialogRef.close();
    this.dialogRef = null;
  }

}
