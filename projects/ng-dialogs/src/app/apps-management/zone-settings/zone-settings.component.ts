import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EnableLanguagesComponent } from '../shared/modals/enable-languages/enable-languages.component';

@Component({
  selector: 'app-zone-settings',
  templateUrl: './zone-settings.component.html',
  styleUrls: ['./zone-settings.component.scss'],
})
export class ZoneSettingsComponent implements OnInit, OnDestroy {
  private languagesDialogRef: MatDialogRef<EnableLanguagesComponent, any>;
  private subscriptions: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
    if (this.languagesDialogRef) {
      this.languagesDialogRef.close();
      this.languagesDialogRef = null;
    }
  }

  openLanguages() {
    this.languagesDialogRef = this.dialog.open(EnableLanguagesComponent, {
      backdropClass: 'enable-languages-dialog-backdrop',
      panelClass: ['enable-languages-dialog-panel', 'dialog-panel-medium'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscriptions.push(
      this.languagesDialogRef.afterClosed().subscribe(() => {
        console.log('Enable Languages dialog was closed.');
      }),
    );
  }
}
