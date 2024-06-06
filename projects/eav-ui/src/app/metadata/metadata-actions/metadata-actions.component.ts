import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MetadataItem } from '../models/metadata.model';
import { MetadataActionsParams } from './metadata-actions.models';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-metadata-actions',
    templateUrl: './metadata-actions.component.html',
    styleUrls: ['./metadata-actions.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
    ],
})
export class MetadataActionsComponent implements ICellRendererAngularComp {
  private params: ICellRendererParams & MetadataActionsParams;

  agInit(params: ICellRendererParams & MetadataActionsParams): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deleteMetadata(): void {
    const metadata: MetadataItem = this.params.data;
    this.params.onDelete(metadata);
  }
}
