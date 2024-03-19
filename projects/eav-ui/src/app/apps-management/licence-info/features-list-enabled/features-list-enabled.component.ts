import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-features-list-enabled',
    templateUrl: './features-list-enabled.component.html',
    styleUrls: ['./features-list-enabled.component.scss'],
    standalone: true,
    imports: [MatIconModule],
})
export class FeaturesListEnabledComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
