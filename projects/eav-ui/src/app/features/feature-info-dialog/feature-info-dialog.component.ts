import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../core';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { signalObj } from '../../shared/signals/signal.utilities';
import { Feature } from '../models';
import { FeatureDetailService } from '../services/feature-detail.service';

@Component({
  selector: 'app-feature-info-dialog',
  templateUrl: './feature-info-dialog.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TippyDirective,
    SafeHtmlPipe,
  ]
})
export class FeatureInfoDialogComponent {

  // TODO: THIS component shows the same details as the FeatureDetailsDialogComponent
  // TODO: @2pp pls change to just load the feature, then include the <app-feature-details-dialog [specs]="{ feature: ..., showStatus: true, showGuid: false, ...">
  // So the end result is a simple @if (...) <app-feature-details-dialog [specs]="{ feature: ... }>
  // for an example of the tag how it's used, check out FeaturesUsedButUnlicensedComponent
  // but this file will basically just have 3 lines of html

  #featureDetailSvc = transient(FeatureDetailService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: string,
    protected dialog: MatDialogRef<FeatureInfoDialogComponent>,
    private snackBar: MatSnackBar,
  ) {
    this.#featureDetailSvc.getFeatureDetails(this.dialogData).subscribe(f => this.featureDetails.set(f));
  }

  protected featureDetails = signalObj<Feature>('feature', null);

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
