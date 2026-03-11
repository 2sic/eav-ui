import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Feature } from '../../../features/models/feature.model';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { FeaturesStatusParams } from './features-status.models';

@Component({
  selector: 'app-features-status',
  templateUrl: './features-status.html',
  styleUrls: ['./features-status.scss'],
  imports: [
    MatSlideToggleModule,
    NgClass,
    TippyDirective,
  ]
})
export class FeaturesStatusComponent
  extends AgGridCellRendererBaseComponent<Feature, boolean | null, FeaturesStatusRendererParams> {

  get disabled(): boolean { return this.params.isDisabled(this.data); }

  get tooltip(): string { return this.params.tooltipGetter(this.data); }

  toggle(): void {
    let nextValue: boolean | null;

    switch (this.value) {
      case false:
        nextValue = null;
        break;
      case null:
        nextValue = true;
        break;
      case true:
      default:
        nextValue = false;
        break;
    }

    this.value = nextValue;
    this.params.onToggle(this.data, nextValue);
  }
}

type FeaturesStatusRendererParams = FeaturesStatusParams & IdFieldParams<Feature>;