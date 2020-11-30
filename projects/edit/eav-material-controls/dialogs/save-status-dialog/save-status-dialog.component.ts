import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService } from '../../..';
import { PublishMode, PublishModeConstants } from '../../../shared/models/eav/publish-mode.models';
import { PublishStatusService } from '../../../shared/store/ngrx-data/publish-status.service';
import { SaveStatusDialogData, SaveStatusDialogTemplateVars } from './save-status-dialog.models';

@Component({
  selector: 'app-save-status-dialog',
  templateUrl: './save-status-dialog.component.html',
  styleUrls: ['./save-status-dialog.component.scss'],
})
export class SaveStatusDialogComponent implements OnInit {
  publishModes = PublishModeConstants;
  templateVars$: Observable<SaveStatusDialogTemplateVars>;

  constructor(
    private dialogRef: MatDialogRef<SaveStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: SaveStatusDialogData,
    private publishStatusService: PublishStatusService,
    private eavService: EavService,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit() {
    const publishMode$ = this.publishStatusService.getPublishMode$(this.dialogData.formId);
    this.templateVars$ = combineLatest([publishMode$]).pipe(
      map(([publishMode]) => {
        const templateVars: SaveStatusDialogTemplateVars = {
          publishMode,
        };
        return templateVars;
      }),
    );
  }

  setPublishMode(publishMode: PublishMode) {
    this.publishStatusService.setPublishMode(publishMode, this.dialogData.formId, this.eavService);
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
