import { Component, OnInit } from '@angular/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { AdamHintViewModel } from './adam-hint.models';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatDividerModule } from '@angular/material/divider';

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
export class AdamHintComponent implements OnInit {

  viewModel$: Observable<AdamHintViewModel>;

  constructor(private featuresService: FeaturesService) { }

  ngOnInit() {
    const showAdamSponsor$ = this.featuresService.isEnabled$(FeatureNames.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([showAdamSponsor$]).pipe(
      map(([showAdamSponsor]) => {
        const viewModel: AdamHintViewModel = {
          showAdamSponsor,
        };
        return viewModel;
      }),
    );
  }
}
