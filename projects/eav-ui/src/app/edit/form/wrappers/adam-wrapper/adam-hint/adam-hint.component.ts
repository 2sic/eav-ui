import { Component, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { FeaturesConstants } from '../../../../shared/constants';
import { WipFeatureService } from '../../../../shared/store/ngrx-data';
import { AdamHintTemplateVars } from './adam-hint.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-hint',
  templateUrl: './adam-hint.component.html',
  styleUrls: ['./adam-hint.component.scss'],
})
export class AdamHintComponent implements OnInit {

  templateVars$: Observable<AdamHintTemplateVars>;

  constructor(private featureService: WipFeatureService) { }

  ngOnInit() {
    const showAdamSponsor$ = this.featureService.isFeatureEnabled$(FeaturesConstants.NoSponsoredByToSic).pipe(
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
