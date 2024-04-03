import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Field } from '../models/field.model';
import { ContentTypeFieldsTitleParams } from './content-type-fields-title.models';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-content-type-fields-title',
    templateUrl: './content-type-fields-title.component.html',
    styleUrls: ['./content-type-fields-title.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
    ],
})
export class ContentTypeFieldsTitleComponent implements ICellRendererAngularComp {
  isTitle: boolean;
  field: Field;

  private params: ICellRendererParams & ContentTypeFieldsTitleParams;

  agInit(params: ICellRendererParams & ContentTypeFieldsTitleParams): void {
    this.params = params;
    this.isTitle = params.value;
    this.field = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  setTitle(): void {
    this.params.onSetTitle(this.field);
  }
}
