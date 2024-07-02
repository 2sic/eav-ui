import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../shared/directives/tippy.directive';

@Component({
  selector: 'app-app-name-show',
  templateUrl: './app-name-show.component.html',
  styleUrls: ['./app-name-show.component.scss'],
  standalone: true,
  imports: [MatIconModule, TippyDirective,],
})
export class AppNameShowComponent implements ICellRendererAngularComp {
  name: string;
  tooltip: string;

  agInit(params: ICellRendererParams & IdFieldParams): void {
    this.name = params.value;
    this.tooltip = params.tooltipGetter(params.data);
  }

  refresh(params?: any): boolean {
    return true;
  }
}
