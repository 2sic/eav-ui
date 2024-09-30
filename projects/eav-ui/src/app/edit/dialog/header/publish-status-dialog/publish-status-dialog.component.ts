import { AsyncPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { Of } from '../../../../core';
import { FormConfigService } from '../../../form/form-config.service';
import { FormPublishingService } from '../../../form/form-publishing.service';
import { PublishModes } from '../../main/edit-dialog-main.models';
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
    private dialog: MatDialogRef<PublishStatusDialogComponent>,
    private publishStatusService: FormPublishingService,
    private formConfig: FormConfigService,
  ) {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlS(event))
        event.preventDefault();
    });
  }

  setPublishMode(publishMode: Of<typeof PublishModes>) {
    this.publishStatusService.setPublishMode(publishMode, this.formConfig.config.formId, this.formConfig);
    this.closeDialog();
  }

  private closeDialog() {
    this.dialog.close();
  }
}
