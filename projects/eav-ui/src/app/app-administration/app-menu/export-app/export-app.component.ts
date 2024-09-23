import { Component, computed, inject, model, OnInit, signal } from '@angular/core';
import { MatDialogActions } from '@angular/material/dialog';
import { AppInfo } from '../../models/app-info.model';
import { ExportAppService } from '../../services/export-app.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { transient } from '../../../core';
import { MatIconModule } from '@angular/material/icon';
import { FeaturesScopedService } from '../../../features/features-scoped.service';
import { FeatureNames } from '../../../features/feature-names';
import { FeatureIconIndicatorComponent } from '../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { FeatureIconComponent } from '../../../features/feature-icon/feature-icon.component';

@Component({
  selector: 'app-export-app',
  templateUrl: './export-app.component.html',
  styleUrls: ['./export-app.component.scss'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,

    FeatureIconIndicatorComponent,
    FeatureIconComponent,
  ],
})
export class ExportAppComponent implements OnInit {

  private exportAppService = transient(ExportAppService);

  appInfo = signal<AppInfo>(null);

  protected features = inject(FeaturesScopedService);
  protected expAssetsAdvEnabled = this.features.enabled[FeatureNames.AppExportAssetsAdvanced];

  ngOnInit() {
    this.exportAppService.getAppInfo().subscribe(appInfo => this.appInfo.set(appInfo));
  }

  // Use Signals
  includeContentGroups = model(false);
  resetAppGuid = model(false);
  assetsAdam = model(true);
  assetsAdamDeleted = model(false);
  assetsSite = model(true);

  downloadUrl = computed(() => this.exportAppService.exportAppUrl()
    + `&includeContentGroups=${this.includeContentGroups()}&resetAppGuid=${this.resetAppGuid()}`
    + `&assetsAdam=${this.assetsAdam()}&assetsSite=${this.assetsSite()}`
  );

}
