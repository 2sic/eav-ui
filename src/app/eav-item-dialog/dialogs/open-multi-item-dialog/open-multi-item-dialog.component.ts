import { Component, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MultiItemEditFormComponent } from '../../multi-item-edit-form/multi-item-edit-form.component';
import { DialogOverviewExampleDialogComponent } from '../dialog-overview-example-dialog/dialog-overview-example-dialog.component';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DialogTypeConstants } from '../../../shared/constants/type-constants';

/**
 * This component only open multi-item-dailog component in mat-dialog window
 */
@Component({
  selector: 'app-open-multi-item-dialog',
  templateUrl: './open-multi-item-dialog.component.html',
  // styleUrls: ['./open-multi-item-dialog.component.css']
})
export class OpenMultiItemDialogComponent implements OnInit {

  constructor(private dialog: MatDialog) {

    // Open dialog
    const dialogRef = this.openDialog(this.dialog);

    // Close dialog
    dialogRef.afterClosed().subscribe(result => {
      this.afterClosedDialog();
    });
  }

  ngOnInit() { }

  /**
   * Open MatDialog without entityid.
   * @param dialog
   */
  private openDialog(dialog: MatDialog) {
    const dialogRef = this.dialog.open(MultiItemEditFormComponent, {
      width: '650px',
      // height: '90%',
      // disableClose = true,
      // autoFocus = true,
      data: {
        id: null,
        type: DialogTypeConstants.byAppContent
      }
    });

    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '650px';
    // // dialogConfig.disableClose = true;
    // // dialogConfig.autoFocus = true;
    // dialogConfig.data = {
    //   id: null,
    //   type: DialogTypeConstants.byAppContent
    // };

    // const dialogRef = dialog.open(MultiItemEditFormComponent, dialogConfig);
    return dialogRef;
  }

  /**
   * Trigger after dialog is closed
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
