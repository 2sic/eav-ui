import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss']
})
export class FeatureIconComponent extends FeatureComponentBase /* implements OnInit */ {
  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featuresService: FeaturesService,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(dialog, viewContainerRef, changeDetectorRef, featuresService);
  }

  // ngOnInit(): void {
  //   super.ngOnInit();
  // }
}
