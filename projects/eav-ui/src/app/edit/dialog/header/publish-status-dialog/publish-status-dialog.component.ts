import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { combineLatest, map, Observable } from 'rxjs';
import { PublishMode, PublishModes } from '../../../shared/models';
import { EavService } from '../../../shared/services';
import { PublishStatusService } from '../../../shared/store/ngrx-data';
import { PublishStatusDialogViewModel } from './publish-status-dialog.models';

@Component({
  selector: 'app-publish-status-dialog',
  templateUrl: './publish-status-dialog.component.html',
  styleUrls: ['./publish-status-dialog.component.scss'],
})
export class PublishStatusDialogComponent implements OnInit {
  PublishModes = PublishModes;
  viewModel$: Observable<PublishStatusDialogViewModel>;

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
    this.viewModel$ = combineLatest([publishMode$]).pipe(
      map(([publishMode]) => {
        const viewModel: PublishStatusDialogViewModel = {
          publishMode,
          options: this.eavService.eavConfig.versioningOptions,
        };
        return viewModel;
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
