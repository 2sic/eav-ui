import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Feature } from '../../apps-management/models/feature.model';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { openFeatureInfo } from '../shared/features-shared';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss']
})
export class FeatureIconComponent implements OnInit {
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
    openFeatureInfo(this.dialog, this.viewContainerRef, this.feature);
  }
}
