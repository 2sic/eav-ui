import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { BaseFeatureComponent } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss']
})
export class FeatureIconComponent extends BaseFeatureComponent implements OnInit {
  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featureService: FeatureService,
  ) {
    super(dialog, viewContainerRef, featureService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
