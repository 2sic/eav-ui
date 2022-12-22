import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { FeatureSummary } from '../models';
import { BaseFeatureWithDialogComponent } from '../shared/base-feature-with-dialog.component';

@Component({
  selector: 'app-feature-text-info',
  templateUrl: './feature-text-info.component.html',
  styleUrls: ['./feature-text-info.component.scss']
})
export class FeatureTextInfoComponent extends BaseFeatureWithDialogComponent implements OnInit {

  // TODO: SHOULD later use the normal 'feature' property, but that's still of the complex type which we won't always have
  featureSummary: FeatureSummary;

  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featureService: FeatureService,
  ) {
    super(dialog, viewContainerRef, featureService);

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
