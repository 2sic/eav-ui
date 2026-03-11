import { Component } from '@angular/core';
import { Feature } from '../../../features/models/feature.model';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';

@Component({
  selector: 'app-features-list-enabled-reason',
  templateUrl: './features-list-enabled-reason.html',
  imports: [TippyDirective]
})
export class FeaturesListEnabledReasonComponent
  extends AgGridCellRendererBaseComponent<Feature, boolean> {

  get feature(): Feature {
    return this.data;
  }
}