import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Feature } from '../../../features/models/feature.model';
import { TippyDirective } from '../../../shared/directives/tippy.directive';

// TODO: 2rb show 2dm

@Component({
    selector: 'app-features-list-enabled-reason',
    templateUrl: './features-list-enabled-reason.html',
    imports: [TippyDirective]
})
export class FeaturesListEnabledReasonComponent implements ICellRendererAngularComp {
  value: boolean;
  feature: Feature;

  agInit(params: ICellRendererParams): void {
    this.value = params.value;
    this.feature = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
