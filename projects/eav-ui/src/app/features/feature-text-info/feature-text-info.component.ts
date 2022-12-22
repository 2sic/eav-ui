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

  // TODO: SHOULD later use the normal 'feature' property, but that's still of the complex type which we won't always have
  featureSummary: FeatureSummary;

  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featuresService: FeaturesService
  ) {
    super(dialog, viewContainerRef, featuresService);

    this.featureSummary = {
      NameId: 'test',
      Enabled: false,
      Name: 'longer name'
    };
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

}
