import { Component, Inject, input, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { FeatureDetailsDialogData } from './feature-details-dialog.models';

@Component({
  selector: 'app-feature-details-dialog',
  templateUrl: './feature-details-dialog.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TippyDirective,
    SafeHtmlPipe,
    TranslateModule,
  ]
})
export class FeatureDetailsDialogComponent {

  specs = input<FeatureDetailsDialogData>();

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogSpecs: FeatureDetailsDialogData,
    protected dialog: MatDialogRef<FeatureDetailsDialogComponent>,
    private snackBar: MatSnackBar,
  ) { }

  protected mySpecs = computedObj('mySpecs', () => this.dialogSpecs ?? this.specs());

  protected feature = computedObj('feature', () => this.mySpecs().feature);

  protected clipboard = transient(ClipboardService);
}
