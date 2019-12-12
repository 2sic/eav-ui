import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppsManagementDialogParamsService } from '../shared/services/apps-management-dialog-params.service';
import { EnableLanguagesComponent } from '../shared/modals/enable-languages/enable-languages.component';
import { EnableLanguagesDialogData } from '../shared/models/enable-languages-dialog-data.model';

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
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
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
    const languagesDialogData: EnableLanguagesDialogData = {
      context: this.appsManagementDialogParamsService.context,
    };
    this.languagesDialogRef = this.dialog.open(EnableLanguagesComponent, {
      backdropClass: 'enable-languages-dialog-backdrop',
      panelClass: 'enable-languages-dialog-panel',
      data: languagesDialogData,
    });
    this.subscriptions.push(
      this.languagesDialogRef.afterClosed().subscribe(() => {
        console.log('Enable Languages dialog was closed.');
      }),
    );
  }
}
