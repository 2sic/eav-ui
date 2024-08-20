import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BaseWithChildDialogComponent } from '../../shared/components/base-with-child-dialog.component';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { ExportAppService } from '../services/export-app.service';
import { ImportAppPartsService } from '../services/import-app-parts.service';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { transient } from '../../core';

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
  ],
})
export class AppStateComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {
  dialogSettings: DialogSettings;

  private importAppPartsService = transient(ImportAppPartsService);
  private exportAppService = transient(ExportAppService);

  public appStateAdvanced = false;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private appDialogConfigService: AppDialogConfigService
  ) {
    super(router, route);
  }

  ngOnInit() {
    this.appDialogConfigService.getCurrent$().subscribe((dialogSettings) => {
      this.dialogSettings = dialogSettings;
    });
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
    super.ngOnDestroy();
  }

  exportAppXml(withFiles: boolean) {
    this.snackBar.open('Exporting...');
    this.exportAppService.exportForVersionControl({ includeContentGroups: true, resetAppGuid: false, withFiles }).subscribe({
      next: result => {
        this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }

  resetApp(withFiles: boolean) {
    if (!confirm('Are you sure? All changes since last xml export will be lost')) { return; }
    this.snackBar.open('Resetting...');
    this.importAppPartsService.resetApp(withFiles).subscribe({
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
