import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { Feature } from '../../models/feature.model';
import { FeaturesStatusParams } from './features-status.models';

@Component({
  selector: 'app-features-status',
  templateUrl: './features-status.component.html',
  styleUrls: ['./features-status.component.scss'],
})
export class FeaturesStatusComponent implements ICellRendererAngularComp {
  value: boolean | null;
  disabled: boolean;
  private params: FeaturesStatusParams;

  agInit(params: FeaturesStatusParams) {
    this.params = params;
    this.value = this.params.value;
    this.disabled = this.params.isDisabled();
  }

  refresh(params: FeaturesStatusParams): boolean {
    this.disabled = this.params.isDisabled();
    return true;
  }

  toggle() {
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
