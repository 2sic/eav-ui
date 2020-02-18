import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { PipelinesService } from '../../services/pipelines.service';

@Component({
  selector: 'app-import-query',
  templateUrl: './import-query.component.html',
  styleUrls: ['./import-query.component.scss']
})
export class ImportQueryComponent implements OnInit, OnDestroy {
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

  ngOnDestroy() {
    this.closeDialog();
  }

  async importQuery() {
    this.viewState = this.viewStates.Waiting;
    (await this.pipelinesService.importQuery(this.importFile)).subscribe(res => {
      this.viewState = this.viewStates.Imported;
    });
  }

  fileChange(event: Event) {
    this.importFile = (<HTMLInputElement>event.target).files[0];
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}
