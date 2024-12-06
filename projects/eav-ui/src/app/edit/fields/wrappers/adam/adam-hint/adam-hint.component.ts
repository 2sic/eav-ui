import { FeatureNames } from './../../../../../features/feature-names';
import { FeaturesScopedService } from '../../../../../features/features-scoped.service';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'adam-hint',
    templateUrl: './adam-hint.component.html',
    styleUrls: ['./adam-hint.component.scss'],
    imports: [
        MatDividerModule,
        MatIconModule,
        AsyncPipe,
        TranslateModule,
        TippyDirective,
    ]
})
export class AdamHintComponent {
  public features = inject(FeaturesScopedService);
  protected hideAdamSponsor = this.features.isEnabled[FeatureNames.NoSponsoredByToSic];
}
