import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { FeatureInfoBoxComponent } from '../../../features/feature-info-box/feature-info-box';
import { FeatureNames } from '../../../features/feature-names';
import { FeaturesService } from '../../../features/features.service';
import { ExportAppService } from '../../services/export-app.service';
import { ImportAppPartsService } from '../../services/import-app-parts.service';

@Component({
  selector: 'app-app-state',
  templateUrl: './app-state.html',
  styleUrls: ['./app-state.scss'],
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FeatureInfoBoxComponent,
    MatDialogActions,
  ]
})
export class AppStateComponent implements OnDestroy {

  #importAppPartsSvc = transient(ImportAppPartsService);
  #exportAppSvc = transient(ExportAppService);
  #featuresSvc = transient(FeaturesService);

  AppSyncWithSiteFiles = FeatureNames.AppExportAssetsAdvanced;

  constructor(private snackBar: MatSnackBar) { }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  protected appExportAssetsAdvancedEnabled = this.#featuresSvc.isEnabled[FeatureNames.AppExportAssetsAdvanced];

  async exportAppXml(withFiles: boolean) {
    this.snackBar.open('Exporting...');
    try {
      // Wait for the API call to complete and get the status code
      const status = await this.#exportAppSvc.exportForVersionControl({ includeContentGroups: true, resetAppGuid: false, withFiles });
      if (status >= 200 && status < 300) {
        this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 })
      }
    } catch (error) {
      console.error('Error toggling language:', error);
      this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 })
    }
  }

  // TODO: @2dg with Promise ?
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
