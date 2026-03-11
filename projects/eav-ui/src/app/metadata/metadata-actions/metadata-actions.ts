import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { MetadataItem } from '../models/metadata.model';
import { MetadataActionsParams, MetadataActionsVerb } from './metadata-actions.models';

@Component({
  selector: 'app-metadata-actions',
  templateUrl: './metadata-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ]
})
export class MetadataActionsComponent
  extends AgGridActionsBaseComponent<MetadataItem, MetadataActionsVerb, MetadataActionsParams> {
}

