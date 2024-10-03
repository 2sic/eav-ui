import { Component, inject, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../../../../core';
import { FeatureDetailsDialogComponent } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.component';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { classLog, commonSpecs } from '../../shared/logging';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { signalObj } from '../../shared/signals/signal.utilities';
import { FeaturesScopedService } from '../features-scoped.service';
import { Feature } from '../models/feature.model';
import { FeatureDetailService } from '../services/feature-detail.service';

const logSpecs = {
  ...commonSpecs,
  unlicensedFeatures: false,
};

@Component({
  selector: 'app-features-used-but-unlicensed-dialog',
  templateUrl: './features-used-but-unlicensed-dialog.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TippyDirective,
    SafeHtmlPipe,
    FeatureDetailsDialogComponent,
  ]
})
export class FeaturesUsedButUnlicensedComponent {

  log = classLog({ FeaturesUsedButUnlicensedComponent }, logSpecs, true);

  #features = inject(FeaturesScopedService);

  #featureDetails = transient(FeatureDetailService);
  
  constructor() {
    const l = this.log.fnIf('constructor');
    const unlicensed = this.#features.unlicensedFeatures();
    for (const nameId of unlicensed) {
      this.#featureDetails.getFeatureDetails(nameId).subscribe(f => {
        this.features.update(prev => [...prev, f]);
      });
    }
  }

  protected features = signalObj<Feature[]>('features', []);
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
