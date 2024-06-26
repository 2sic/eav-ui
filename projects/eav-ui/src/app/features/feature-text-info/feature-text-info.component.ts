import { Component, Input } from '@angular/core';
import { FeatureSummary } from '../models';
import { FeatureComponentBase, FeatureComponentProviders } from '../shared/base-feature.component';
import { BehaviorSubject, map, Observable, combineLatest } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { FeatureDetailService } from '../services/feature-detail.service';

@Component({
  selector: 'app-feature-text-info',
  templateUrl: './feature-text-info.component.html',
  styleUrls: ['./feature-text-info.component.scss'],
  standalone: true,
  imports: [SharedComponentsModule, MatIconModule, AsyncPipe, TranslateModule],
  providers: [
    ...FeatureComponentProviders,
    FeatureDetailService,
  ]
})
export class FeatureTextInfoComponent extends FeatureComponentBase {
  @Input()
  public set asInfo(value: boolean) { this.asInfo$.next(value); }
  asInfo$ = new BehaviorSubject<boolean>(false);

  viewModel$: Observable<FeatureTextInfoViewModel>;

  constructor() {
    super();
    this.viewModel$ = combineLatest([this.feature$, this.asInfo$, this.show$]).pipe(
      map(([feature, asInfo, show]) =>
      ({
        feature,
        icon: asInfo ? 'info' : 'warning',
        show
      }))
    );
  }

}

interface FeatureTextInfoViewModel {
  feature: FeatureSummary;
  icon: string;
  show: boolean;
}
