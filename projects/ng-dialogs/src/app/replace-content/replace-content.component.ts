import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-replace-content',
  templateUrl: './replace-content.component.html',
  styleUrls: ['./replace-content.component.scss']
})
export class ReplaceContentComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ReplaceContentComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
