import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureService } from '../../edit/shared/store/ngrx-data';
import { BaseFeatureWithDialogComponent } from '../shared/base-feature-with-dialog.component';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss']
})
export class FeatureIconComponent extends BaseFeatureWithDialogComponent implements OnInit {
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
