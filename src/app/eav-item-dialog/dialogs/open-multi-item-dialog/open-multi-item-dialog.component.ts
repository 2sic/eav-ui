import { Component, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MultiItemEditFormComponent } from '../../multi-item-edit-form/multi-item-edit-form.component';
import { EavAdminUiService } from '../../../shared/services/eav-admin-ui.service';

/**
 * This component only open multi-item-dailog component in mat-dialog window
 */
@Component({
  selector: 'app-open-multi-item-dialog',
  templateUrl: './open-multi-item-dialog.component.html',
  // styleUrls: ['./open-multi-item-dialog.component.css']
})
export class OpenMultiItemDialogComponent implements OnInit {

  constructor(private dialog: MatDialog,
    private eavAdminUiService: EavAdminUiService) {

    // Open dialog
    const dialogRef = this.eavAdminUiService.openItemEditWithContent(this.dialog, MultiItemEditFormComponent);

    // Close dialog
    dialogRef.afterClosed().subscribe(result => {
      this.afterClosedDialog();
    });
  }

  ngOnInit() { }

  /**
   * Triggered after dialog is closed
   */
  private afterClosedDialog() {
    console.log('The dialog was closed');
    // find and remove iframe
    // TODO: this is not good - need to find better solution
    const iframes = window.parent.frames.document.getElementsByTagName('iframe');
    if (iframes[0] && iframes[0].parentElement) {
      iframes[0].parentElement.remove();
    }
  }
}
