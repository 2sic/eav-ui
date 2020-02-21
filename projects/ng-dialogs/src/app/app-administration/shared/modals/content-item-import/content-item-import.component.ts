import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-content-item-import',
  templateUrl: './content-item-import.component.html',
  styleUrls: ['./content-item-import.component.scss']
})
export class ContentItemImportComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ContentItemImportComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
