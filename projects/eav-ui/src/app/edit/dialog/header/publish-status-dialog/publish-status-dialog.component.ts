import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { FormConfigService } from '../../../state/form-config.service';
import { PublishMode, PublishModes } from '../../main/edit-dialog-main.models';
import { PublishStatusService } from '../../../shared/store/publish-status.service';
import { isCtrlS } from '../../main/keyboard-shortcuts';

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
export class PublishStatusDialogComponent {
  PublishModes = PublishModes;

  protected publishMode = this.publishStatusService.getPublishMode(this.formConfig.config.formId)
  protected options = this.formConfig.config.versioningOptions;

  constructor(
    private dialogRef: MatDialogRef<PublishStatusDialogComponent>,
    private publishStatusService: PublishStatusService,
    private formConfig: FormConfigService,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      if (isCtrlS(event))
        event.preventDefault();
    });
  }

  setPublishMode(publishMode: PublishMode) {
    this.publishStatusService.setPublishMode(publishMode, this.formConfig.config.formId, this.formConfig);
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
