import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { combineLatest, map, Observable } from 'rxjs';
import { PublishMode, PublishModes } from '../../../shared/models';
import { FormConfigService } from '../../../shared/services';
import { PublishStatusService } from '../../../shared/store/ngrx-data';
import { PublishStatusDialogViewModel } from './publish-status-dialog.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-publish-status-dialog',
    templateUrl: './publish-status-dialog.component.html',
    styleUrls: ['./publish-status-dialog.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        MatListModule,
        NgClass,
        ExtendedModule,
        MatIconModule,
        AsyncPipe,
        TranslateModule,
    ],
})
export class PublishStatusDialogComponent implements OnInit {
  PublishModes = PublishModes;
  viewModel$: Observable<PublishStatusDialogViewModel>;

  constructor(
    private dialogRef: MatDialogRef<PublishStatusDialogComponent>,
    private publishStatusService: PublishStatusService,
    private formConfig: FormConfigService,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit() {
    const publishMode$ = this.publishStatusService.getPublishMode$(this.formConfig.config.formId);
    this.viewModel$ = combineLatest([publishMode$]).pipe(
      map(([publishMode]) => {
        const viewModel: PublishStatusDialogViewModel = {
          publishMode,
          options: this.formConfig.config.versioningOptions,
        };
        return viewModel;
      }),
    );
  }

  setPublishMode(publishMode: PublishMode) {
    this.publishStatusService.setPublishMode(publishMode, this.formConfig.config.formId, this.formConfig);
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
