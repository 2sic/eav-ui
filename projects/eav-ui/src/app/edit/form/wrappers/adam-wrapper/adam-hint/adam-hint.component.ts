import { Component } from '@angular/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatDividerModule } from '@angular/material/divider';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-hint',
  templateUrl: './adam-hint.component.html',
  styleUrls: ['./adam-hint.component.scss'],
  standalone: true,
  imports: [
    MatDividerModule,
    SharedComponentsModule,
    MatIconModule,
    AsyncPipe,
    TranslateModule,
  ],
})
export class AdamHintComponent {

  protected hideAdamSponsor = toSignal(this.featuresService.isEnabled$(FeatureNames.NoSponsoredByToSic), { initialValue: true });
  
  constructor(private featuresService: FeaturesService) { }

}
