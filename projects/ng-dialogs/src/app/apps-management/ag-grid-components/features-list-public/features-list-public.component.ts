import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-features-list-public',
  templateUrl: './features-list-public.component.html',
  styleUrls: ['./features-list-public.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesListPublicComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
