import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../../core';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
import { DialogSettings } from '../../../shared/models/dialog-settings.model';
import { DialogConfigAppService } from '../../services/dialog-config-app.service';
import { ExportAppService } from '../../services/export-app.service';
import { ImportAppPartsService } from '../../services/import-app-parts.service';

@Component({
  selector: 'app-app-state',
  templateUrl: './app-state.component.html',
  styleUrls: ['./app-state.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    FeatureTextInfoComponent,
    RouterOutlet,
    MatDialogActions,
  ],
})
export class AppStateComponent implements OnInit, OnDestroy {
  dialogSettings: DialogSettings;

  #importAppPartsSvc = transient(ImportAppPartsService);
  #exportAppSvc = transient(ExportAppService);

  public appStateAdvanced = false;

  #dialogConfigSvc = transient(DialogConfigAppService);

  constructor(
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.#dialogConfigSvc.getCurrent$().subscribe((dialogSettings) => {
      this.dialogSettings = dialogSettings;
    });
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  exportAppXml(withFiles: boolean) {
    this.snackBar.open('Exporting...');
    this.#exportAppSvc.exportForVersionControl({ includeContentGroups: true, resetAppGuid: false, withFiles }).subscribe({
      next: result => {
        this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }

  resetApp(withFiles: boolean) {
    if (!confirm('Are you sure? All changes since last xml export will be lost')) return;
    this.snackBar.open('Resetting...');
    this.#importAppPartsSvc.resetApp(withFiles).subscribe({
      next: result => {
        this.snackBar.open(
          'Reset worked! Since this is a complex operation, please restart the Website to ensure all caches are correct',
          null,
          { duration: 30000 },
        );
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Reset failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }
}
