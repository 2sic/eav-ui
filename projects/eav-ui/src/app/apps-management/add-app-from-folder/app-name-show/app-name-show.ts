import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { PendingApp } from '../../models/app.model';

@Component({
  selector: 'app-app-name-show',
  templateUrl: './app-name-show.html',
  styleUrls: ['./app-name-show.scss'],
  imports: [
    MatIconModule,
    TippyDirective,
  ]
})

export class AppNameShowComponent
  extends AgGridCellRendererBaseComponent<PendingApp, string, IdFieldParams<PendingApp>> {

  get name(): string { return this.value; }

  get tooltip(): string { return this.params.tooltipGetter(this.data); }
}