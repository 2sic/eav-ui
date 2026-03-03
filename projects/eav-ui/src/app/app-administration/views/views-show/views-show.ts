import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { View } from '../../models';

@Component({
  selector: 'app-views-show',
  templateUrl: './views-show.html',
  imports: [MatIconModule],
})
export class ViewsShowComponent extends AgGridActionsBaseComponent<View> {}