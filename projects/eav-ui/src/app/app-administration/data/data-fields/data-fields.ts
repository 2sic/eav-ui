import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models/content-type.model';

@Component({
  selector: 'app-data-fields',
  templateUrl: './data-fields.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    TippyDirective,
  ]
})
export class DataFieldsComponent
  extends AgGridActionsBaseComponent<ContentType, 'openFields'> {

  get value() { return this.params?.value; }

  get tooltip() {
    return !this.data?.EditInfo?.ReadOnly
      ? 'Edit fields'
      : `${this.data?.EditInfo?.ReadOnlyMessage ? `${this.data.EditInfo.ReadOnlyMessage}\n\n` : ''}
      This ContentType shares the definition of #${this.data?.SharedDefId} 
      so you can't edit it here. Read 2sxc.org/help?tag=shared-types`;
  }

  get icon() { return !this.data?.EditInfo?.ReadOnly ? 'dns' : 'share'; }

}