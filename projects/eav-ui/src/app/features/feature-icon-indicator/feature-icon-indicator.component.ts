import { Component, OnInit } from '@angular/core';
import { FeaturesService } from '../../shared/services/features.service';
import { BaseFeatureComponent } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon-indicator',
  templateUrl: './feature-icon-indicator.component.html',
  styleUrls: ['./feature-icon-indicator.component.scss']
})
export class FeatureIconIndicatorComponent extends BaseFeatureComponent implements OnInit {

  constructor(featuresService: FeaturesService) {
    super(featuresService);
   }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
