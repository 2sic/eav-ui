import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureDetailsDialogData } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.models';
import { Feature } from '../../apps-management/models/feature.model';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';

@Directive()
export class BaseFeatureComponent implements OnInit {
  @Input() featureNameId: string;

  featureOn: boolean = true;
  feature: Feature = null;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private featureService: FeatureService,
  ) { }

  ngOnInit(): void {
    this.featureOn = this.featureService.isFeatureEnabled(this.featureNameId);
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
