import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-export-app',
  templateUrl: './export-app.component.html',
  styleUrls: ['./export-app.component.scss']
})
export class ExportAppComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ExportAppComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
