import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';

@Directive()
export class BaseFeatureComponent implements OnInit {
  @Input() featureNameId: string;

  featureOn: boolean = true;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    protected featuresService: FeaturesService
  ) { }

  ngOnInit(): void {
    this.featureOn = this.featuresService.isEnabled(this.featureNameId);
  }

  openDialog() {
    this.dialog.open(FeatureInfoDialogComponent, {
      autoFocus: false,
      data: this.featureNameId,
      viewContainerRef: this.viewContainerRef,
      width: '600px',
    });
  }
}
