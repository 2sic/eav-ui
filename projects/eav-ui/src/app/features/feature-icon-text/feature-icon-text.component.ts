import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { BaseFeatureComponent } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon-text',
  templateUrl: './feature-icon-text.component.html',
  styleUrls: ['./feature-icon-text.component.scss']
})
export class FeatureIconTextComponent extends BaseFeatureComponent implements OnInit {
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
