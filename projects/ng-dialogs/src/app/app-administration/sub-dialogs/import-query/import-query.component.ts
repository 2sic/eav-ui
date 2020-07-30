import { Component, OnInit, HostBinding } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

import { PipelinesService } from '../../services/pipelines.service';

@Component({
  selector: 'app-import-query',
  templateUrl: './import-query.component.html',
  styleUrls: ['./import-query.component.scss']
})
export class ImportQueryComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  private viewStates = {
    Default: 1,
    Waiting: 2,
    Imported: 3
  };
  viewState = this.viewStates.Default;
  importFile: File;

  constructor(private dialogRef: MatDialogRef<ImportQueryComponent>, private pipelinesService: PipelinesService) { }

  ngOnInit() {
  }

  async importQuery() {
    this.viewState = this.viewStates.Waiting;
    (await this.pipelinesService.importQuery(this.importFile)).subscribe({
      next: res => {
        this.viewState = this.viewStates.Imported;
      },
      error: (error: HttpErrorResponse) => {
        this.viewState = this.viewStates.Default;
      },
    });
  }

  fileChange(event: Event) {
    this.importFile = (event.target as HTMLInputElement).files[0];
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
