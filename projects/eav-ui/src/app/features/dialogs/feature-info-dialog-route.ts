import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { transient } from 'projects/core';
import { FeatureDetailsDialogComponent } from "../../apps-management/licence-info/feature-details-dialog/feature-details-dialog";
import { FeatureDetailService } from '../services/feature-detail.service';

@Component({
  selector: 'app-feature-info-dialog-route',
  templateUrl: './feature-info-dialog-route.html',
  standalone: true,
  imports: [FeatureDetailsDialogComponent, RouterOutlet],
})
export class FeatureInfoDialogRouteComponent {
  readonly #featureDetailService = transient(FeatureDetailService);

  protected readonly featureId = signal<string>('');

  protected readonly featureDetails = this.#featureDetailService.getFeatureDetail(this.featureId);

  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: string | null,
    route: ActivatedRoute,
  ) {
    const featureIdFromRoute = route.snapshot.paramMap.get('featureId');
    this.featureId.set(featureIdFromRoute || dialogData || '');
  }
}