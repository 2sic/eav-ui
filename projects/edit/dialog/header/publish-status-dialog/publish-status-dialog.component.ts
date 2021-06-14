import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublishMode, PublishModeConstants } from '../../../shared/models';
import { EavService } from '../../../shared/services';
import { PublishStatusService } from '../../../shared/store/ngrx-data';
import { PublishStatusDialogTemplateVars } from './publish-status-dialog.models';

@Component({
  selector: 'app-publish-status-dialog',
  templateUrl: './publish-status-dialog.component.html',
  styleUrls: ['./publish-status-dialog.component.scss'],
})
export class PublishStatusDialogComponent implements OnInit {
  publishModes = PublishModeConstants;
  templateVars$: Observable<PublishStatusDialogTemplateVars>;

  constructor(
    private dialogRef: MatDialogRef<PublishStatusDialogComponent>,
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
    const publishMode$ = this.publishStatusService.getPublishMode$(this.eavService.eavConfig.formId);
    this.templateVars$ = combineLatest([publishMode$]).pipe(
      map(([publishMode]) => {
        const templateVars: PublishStatusDialogTemplateVars = {
          publishMode,
        };
        return templateVars;
      }),
    );
  }

  setPublishMode(publishMode: PublishMode) {
    this.publishStatusService.setPublishMode(publishMode, this.eavService.eavConfig.formId, this.eavService);
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
