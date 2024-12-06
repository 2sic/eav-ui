import { Component, Inject, input, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../../../../../core/transient';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { FeatureDetailsDialogData } from './feature-details-dialog.models';

@Component({
    selector: 'app-feature-details-dialog',
    templateUrl: './feature-details-dialog.component.html',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        SafeHtmlPipe,
        TranslateModule,
    ]
})
export class FeatureDetailsDialogComponent {
  specs = input<FeatureDetailsDialogData>();

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogSpecs: FeatureDetailsDialogData,
    protected dialog: MatDialogRef<FeatureDetailsDialogComponent>,
  ) { }

  protected mySpecs = computedObj('mySpecs', () =>  this.specs() ?? this.dialogSpecs );
  protected feature = computedObj('feature', () => this.mySpecs()?.feature);
  protected clipboard = transient(ClipboardService);
}
