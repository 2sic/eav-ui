import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
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
    FeatureTextInfoComponent,
    MatDialogActions,
  ],
})
export class AppStateComponent implements OnDestroy {

  #importAppPartsSvc = transient(ImportAppPartsService);
  #exportAppSvc = transient(ExportAppService);

  constructor(private snackBar: MatSnackBar) { }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  exportAppXml(withFiles: boolean) {
    this.snackBar.open('Exporting...');
    this.#exportAppSvc.exportForVersionControl({ includeContentGroups: true, resetAppGuid: false, withFiles }).subscribe({
      next: _ => this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 }),
      error: _ => this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 }),
    });
  }

  resetApp(withFiles: boolean) {
    if (!confirm('Are you sure? All changes since last xml export will be lost'))
      return;
    this.snackBar.open('Resetting...');
    this.#importAppPartsSvc.resetApp(withFiles).subscribe({
      next: _ => this.snackBar.open('Reset worked! Since this is a complex operation, please restart the Website to ensure all caches are correct', null, { duration: 30000 }),
      error: _ => this.snackBar.open('Reset failed. Please check console for more details', null, { duration: 3000 }),
    });
  }
}
