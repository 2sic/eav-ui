import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureSummary } from '../models';
import { BaseFeatureComponent } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-text-info',
  templateUrl: './feature-text-info.component.html',
  styleUrls: ['./feature-text-info.component.scss']
})
export class FeatureTextInfoComponent extends BaseFeatureComponent implements OnInit {
  featureSummary: FeatureSummary;

  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featuresService: FeaturesService
  ) {
    super(dialog, viewContainerRef, featuresService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.featureSummary = this.featuresService.getFeature(this.featureNameId);
  }

}
