import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FeaturesScopedService } from '../../../../../features/features-scoped.service';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import { FeatureNames } from './../../../../../features/feature-names';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'adam-hint',
    templateUrl: './adam-hint.component.html',
    styleUrls: ['./adam-hint.component.scss'],
    imports: [
        MatDividerModule,
        MatIconModule,
        TranslateModule,
        TippyDirective,
    ]
})
export class AdamHintComponent {
  public features = inject(FeaturesScopedService);
  protected hideAdamSponsor = this.features.isEnabled[FeatureNames.NoSponsoredByToSic];
}
