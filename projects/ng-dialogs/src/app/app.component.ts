import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // private adminDialogRef: MatDialogRef<AdminDialogRootComponent, any>;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    // this.adminDialogRef = this.dialog.open(AdminDialogRootComponent, {
    //   backdropClass: 'admin-dialog-backdrop',
    //   panelClass: 'admin-dialog-panel',
    // });
    // this.adminDialogRef.afterClosed().subscribe(result => {
    //   console.log('Admin dialog was closed. Result:', result);
    // });
  }
}
