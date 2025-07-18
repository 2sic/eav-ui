import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Feature } from '../../../features/models/feature.model';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { FeaturesStatusParams } from './features-status.models';

@Component({
    selector: 'app-features-status',
    templateUrl: './features-status.component.html',
    styleUrls: ['./features-status.component.scss'],
    imports: [
        MatSlideToggleModule,
        NgClass,
        TippyDirective,
    ]
})
export class FeaturesStatusComponent implements ICellRendererAngularComp {
  value: boolean | null;
  disabled: boolean;
  tooltip: string;

  private params: ICellRendererParams & FeaturesStatusParams;

  agInit(params: ICellRendererParams & FeaturesStatusParams & IdFieldParams<Feature>): void {
    this.params = params;
    this.value = params.value;
    this.disabled = params.isDisabled(params.data);
    this.tooltip = params.tooltipGetter(params.data);
  }

  refresh(params: ICellRendererParams & FeaturesStatusParams): boolean {
    this.disabled = this.params.isDisabled(this.params.data);
    return true;
  }

  toggle(): void {
    const feature: Feature = this.params.data;
    let nextValue: boolean;
    switch (this.value) {
      case false:
        nextValue = null;
        break;
      case null:
        nextValue = true;
        break;
      case true:
        nextValue = false;
        break;
    }
    this.value = nextValue;
    this.params.onToggle(feature, nextValue);
  }
}
