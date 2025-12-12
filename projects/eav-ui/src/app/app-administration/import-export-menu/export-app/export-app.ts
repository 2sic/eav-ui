import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { transient } from '../../../../../../core';
import { DocsLinkHelper } from '../../../admin-shared/docs-link-helper/docs-link-helper';
import { FeatureIconComponent } from '../../../features/feature-icon/feature-icon.component';
import { FeatureNames } from '../../../features/feature-names';
import { FeaturesService } from '../../../features/features.service';
import { ExportAppService } from '../../services/export-app.service';

@Component({
    selector: 'app-export-app',
    templateUrl: './export-app.html',
    styleUrls: ['./export-app.scss'],
    imports: [
        MatCheckboxModule,
        FormsModule,
        MatDialogActions,
        MatButtonModule,
        MatIconModule,
        FeatureIconComponent,
        DocsLinkHelper,
    ]
})
export class ExportAppComponent {

  #exportAppService = transient(ExportAppService);

  appInfo = this.#exportAppService.getAppInfo().value;


  protected features = inject(FeaturesService);
  protected expAssetsAdvEnabled = this.features.isEnabled[FeatureNames.AppExportAssetsAdvanced];

  // Use Signals
  includeContentGroups = model(false);
  resetAppGuid = model(false);
  assetsAdam = model(true);
  assetsAdamDeleted = model(false);
  assetsSite = model(true);

  downloadUrl = computed(() => this.#exportAppService.exportAppUrl()
    + `&includeContentGroups=${this.includeContentGroups()}&resetAppGuid=${this.resetAppGuid()}`
    + `&assetsAdam=${this.assetsAdam()}&assetsSite=${this.assetsSite()}`
  );

}
