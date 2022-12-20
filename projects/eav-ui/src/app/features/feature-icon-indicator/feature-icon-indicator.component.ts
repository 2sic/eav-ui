import { Component, OnInit } from '@angular/core';
import { FeatureService } from '../../edit/shared/store/ngrx-data/feature.service';
import { BaseFeatureComponent } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon-indicator',
  templateUrl: './feature-icon-indicator.component.html',
  styleUrls: ['./feature-icon-indicator.component.scss']
})
export class FeatureIconIndicatorComponent extends BaseFeatureComponent implements OnInit {

  constructor(
    featureService: FeatureService,
  ) {
    super(featureService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

}
