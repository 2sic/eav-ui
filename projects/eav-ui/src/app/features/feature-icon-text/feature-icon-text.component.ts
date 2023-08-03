import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon-text',
  templateUrl: './feature-icon-text.component.html',
  styleUrls: ['./feature-icon-text.component.scss']
})
export class FeatureIconTextComponent extends FeatureComponentBase /* implements OnInit */ {
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
