import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureDetailsDialogData } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.models';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss']
})
export class FeatureIconComponent implements OnInit {
  @Input() featureNameId: string;

  featureOn: boolean = true;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
    this.featureOn = this.featureService.isFeatureEnabled(this.featureNameId);
  }

  openFeatureInfo() {
    const data: FeatureDetailsDialogData = {
      feature: this.featureService.getFeature(this.featureNameId)
    };
    this.dialog.open(FeatureInfoDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
  }
}
