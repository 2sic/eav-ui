import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { MultiItemEditFormComponent } from '../../multi-item-edit-form/multi-item-edit-form.component';
import { EavAdminUiService } from '../../../shared/services/eav-admin-ui.service';
import { AdminDialogPersistedData } from '../../../shared/models/eav';

/** This component only open multi-item-dailog component in mat-dialog window */
@Component({
  selector: 'app-open-multi-item-dialog',
  templateUrl: './open-multi-item-dialog.component.html',
  styleUrls: ['./open-multi-item-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OpenMultiItemDialogComponent implements OnInit, OnDestroy {
  private dialogRef: MatDialogRef<MultiItemEditFormComponent, any>;
  private subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private eavAdminUiService: EavAdminUiService,
  ) {
    const persistedData: AdminDialogPersistedData = {
      isParentDialog: true
    };
    this.dialogRef = this.eavAdminUiService.openItemEditWithContent(this.dialog, MultiItemEditFormComponent, persistedData);
    this.subscription.add(
      this.dialogRef.afterClosed().subscribe(result => {
        (window.parent as any).$2sxc.totalPopup.close();
      })
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}
