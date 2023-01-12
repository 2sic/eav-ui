import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureSummary } from '../models';
import { FeatureComponentBase } from '../shared/base-feature.component';
import { BehaviorSubject, map, Observable, combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'app-feature-text-info',
  templateUrl: './feature-text-info.component.html',
  styleUrls: ['./feature-text-info.component.scss']
})
export class FeatureTextInfoComponent extends FeatureComponentBase {
  @Input()
  public set asInfo(value: boolean) { this.asInfo$.next(value); }
  asInfo$ = new BehaviorSubject<boolean>(false);

  data$: Observable<viewModel>;

  constructor(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    featuresService: FeaturesService
  ) {
    super(dialog, viewContainerRef, featuresService);
    this.data$ = combineLatest([this.feature$, this.asInfo$, this.show$]).pipe(map(([feature, asInfo, show]) => 
      ({
        feature,
        icon: asInfo ? 'info' : 'warning',
        show
      })));
  }

}

interface viewModel {
  feature: FeatureSummary;
  icon: string;
  show: boolean;
}