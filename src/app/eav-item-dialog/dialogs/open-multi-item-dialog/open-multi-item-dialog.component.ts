import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MultiItemEditFormComponent } from '../../multi-item-edit-form/multi-item-edit-form.component';
import { EavAdminUiService } from '../../../shared/services/eav-admin-ui.service';

/**
 * This component only open multi-item-dailog component in mat-dialog window
 */
@Component({
  selector: 'app-open-multi-item-dialog',
  templateUrl: './open-multi-item-dialog.component.html',
  styleUrls: ['./open-multi-item-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OpenMultiItemDialogComponent implements OnInit {

  private dialogRef;

  constructor(private dialog: MatDialog,
    private eavAdminUiService: EavAdminUiService) {
    // Open dialog
    this.dialogRef = this.eavAdminUiService.openItemEditWithContent(this.dialog, MultiItemEditFormComponent);
    // Close dialog
    this.dialogRef.afterClosed().subscribe(result => {
      this.afterClosedDialog();
    });
  }

  ngOnInit() {
  }

  /**
   * Triggered after dialog is closed
   */
  private afterClosedDialog() {
    (window.parent as any).$2sxc.totalPopup.close();
  }
}
