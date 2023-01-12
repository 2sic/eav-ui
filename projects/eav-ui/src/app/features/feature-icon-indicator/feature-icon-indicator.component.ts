import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { BaseFeatureComponent } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon-indicator',
  templateUrl: './feature-icon-indicator.component.html',
  styleUrls: ['./feature-icon-indicator.component.scss']
})
export class FeatureIconIndicatorComponent extends BaseFeatureComponent /* implements OnInit */ {

  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featuresService: FeaturesService
  ) {
    super(dialog, viewContainerRef, featuresService);
  }

  // ngOnInit(): void {
  //   super.ngOnInit();
  // }
}
