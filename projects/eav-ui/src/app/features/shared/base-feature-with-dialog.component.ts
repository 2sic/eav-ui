import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureDetailsDialogData } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.models';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';
import { Feature } from '../models/feature.model';
import { BaseFeatureComponent } from './base-feature.component';

@Directive()
export class BaseFeatureWithDialogComponent extends BaseFeatureComponent implements OnInit {
  feature: Feature = null;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    featureService: FeatureService,
  ) {
    super(featureService);
   }

  ngOnInit(): void {
    super.ngOnInit();
    this.feature = this.featureService.getFeature(this.featureNameId);
  }

  openDialog() {
    const data: FeatureDetailsDialogData = {
      feature: this.feature
    };
    this.dialog.open(FeatureInfoDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
  }
}
