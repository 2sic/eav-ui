import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models/content-type.model';

@Component({
  selector: 'app-data-fields',
  templateUrl: './data-fields.component.html',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    TippyDirective,
  ],
})
export class DataFieldsComponent implements ICellRendererAngularComp {
  value: number;
  tooltip: string;
  icon: string;

  public params: {
    fieldsUrl(contentType: ContentType): string;
  };
  protected contentType: ContentType;

  agInit(params: ICellRendererParams & DataFieldsComponent["params"]): void {
    this.params = params;
    this.contentType = params.data;
    this.value = params.value;
    this.tooltip = !this.contentType.EditInfo.ReadOnly
      ? 'Edit fields'
      : `${this.contentType.EditInfo.ReadOnlyMessage ? `${this.contentType.EditInfo.ReadOnlyMessage}\n\n` : ''}This ContentType shares the definition of #${this.contentType.SharedDefId} so you can't edit it here. Read 2sxc.org/help?tag=shared-types`;
    this.icon = !this.contentType.EditInfo.ReadOnly ? 'dns' : 'share';
  }

  refresh(params?: any): boolean {
    return true;
  }

  // editFields(): void {
  //   this.params.onEditFields(this.contentType);
  // }
}
