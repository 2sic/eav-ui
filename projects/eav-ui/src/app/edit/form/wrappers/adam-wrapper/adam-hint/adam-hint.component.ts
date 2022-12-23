import { Component, OnInit } from '@angular/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { AdamHintTemplateVars } from './adam-hint.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-hint',
  templateUrl: './adam-hint.component.html',
  styleUrls: ['./adam-hint.component.scss'],
})
export class AdamHintComponent implements OnInit {

  templateVars$: Observable<AdamHintTemplateVars>;

  constructor(private featuresService: FeaturesService) { }

  ngOnInit() {
    const showAdamSponsor$ = this.featuresService.isEnabled$(FeatureNames.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([showAdamSponsor$]).pipe(
      map(([showAdamSponsor]) => {
        const templateVars: AdamHintTemplateVars = {
          showAdamSponsor,
        };
        return templateVars;
      }),
    );
  }
}
