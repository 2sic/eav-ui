import { Component, inject, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../../../../core';
import { FeatureDetailsDialogComponent } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog';
import { classLog, commonSpecs } from '../../shared/logging';
import { FeaturesService } from '../features.service';
import { FeatureDetailService } from '../services/feature-detail.service';

const logSpecs = {
  ...commonSpecs,
  unlicensedFeatures: false,
};

@Component({
    selector: 'app-features-used-but-unlicensed-dialog',
    templateUrl: './features-used-but-unlicensed-dialog.component.html',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule,
        FeatureDetailsDialogComponent,
    ]
})
export class FeaturesUsedButUnlicensedComponent {

  log = classLog({ FeaturesUsedButUnlicensedComponent }, logSpecs);

  #features = inject(FeaturesService);

  #featureDetails = transient(FeatureDetailService);

  constructor() {
    const l = this.log.fnIf('constructor');
  }

  protected features = this.#featureDetails.getFeatureDetails(this.#features.unlicensedFeatures());
  

}


/**
 *
 * @param dialog
 * @param viewContainerRef the container ref is important to get services (eg. features) from the parent component
 */
export function openFeaturesUsedButUnlicensedDialog(dialog: MatDialog, viewContainerRef: ViewContainerRef) {
  dialog.open(FeaturesUsedButUnlicensedComponent, {
    autoFocus: false,
    viewContainerRef: viewContainerRef,
    width: '600px',
  });
}
