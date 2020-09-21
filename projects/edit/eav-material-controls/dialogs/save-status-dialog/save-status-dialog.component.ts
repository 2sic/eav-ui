import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublishMode, PublishModeConstants } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.constants';

@Component({
  selector: 'app-save-status-dialog',
  templateUrl: './save-status-dialog.component.html',
  styleUrls: ['./save-status-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveStatusDialogComponent implements OnInit {
  publishMode: PublishMode;
  Modes = PublishModeConstants;

  constructor(private dialogRef: MatDialogRef<SaveStatusDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: PublishMode) { }

  ngOnInit() {
    this.publishMode = this.data;
  }

  setMode(mode: PublishMode) {
    this.dialogRef.close(mode);
  }
}
