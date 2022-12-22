import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { FeaturesService } from '../../shared/services/features.service';
import { BaseFeatureWithDialogComponent } from '../shared/base-feature-with-dialog.component';

@Component({
  selector: 'app-feature-icon-text',
  templateUrl: './feature-icon-text.component.html',
  styleUrls: ['./feature-icon-text.component.scss']
})
export class FeatureIconTextComponent extends BaseFeatureWithDialogComponent implements OnInit {
  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featureService: FeatureService,
    featuresService: FeaturesService
  ) {
    super(dialog, viewContainerRef, featureService, featuresService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
