import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
  selector: 'app-feature-icon-indicator',
  templateUrl: './feature-icon-indicator.component.html',
  styleUrls: ['./feature-icon-indicator.component.scss']
})
export class FeatureIconIndicatorComponent extends FeatureComponentBase /* implements OnInit */ {

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
