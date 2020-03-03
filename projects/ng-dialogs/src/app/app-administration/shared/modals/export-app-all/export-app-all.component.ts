import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-export-app-all',
  templateUrl: './export-app-all.component.html',
  styleUrls: ['./export-app-all.component.scss']
})
export class ExportAppAllComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ExportAppAllComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
