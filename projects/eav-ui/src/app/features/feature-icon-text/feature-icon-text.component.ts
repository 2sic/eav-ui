import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureComponentBase } from '../shared/base-feature.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-feature-icon-text',
    templateUrl: './feature-icon-text.component.html',
    styleUrls: ['./feature-icon-text.component.scss'],
    standalone: true,
    imports: [MatIconModule, SharedComponentsModule, AsyncPipe, TranslateModule]
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
