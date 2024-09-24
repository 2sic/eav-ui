import { AsyncPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { transient } from '../../core';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
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
    AsyncPipe,
    TranslateModule,
    TippyDirective,
    SafeHtmlPipe,
  ]
})
export class FeatureInfoDialogComponent implements OnInit {
  viewModel$: Observable<Feature>;

  private featureDetailService = transient(FeatureDetailService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: string,
    private dialogRef: MatDialogRef<FeatureInfoDialogComponent>,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.viewModel$ = this.featureDetailService.getFeatureDetails(this.dialogData);
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  findOutMore(link: string): void {
    window.open(link, '_blank');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
