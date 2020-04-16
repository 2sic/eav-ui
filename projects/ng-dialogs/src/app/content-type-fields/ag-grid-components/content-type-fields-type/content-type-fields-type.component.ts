import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

@Component({
  selector: 'app-content-type-fields-type',
  templateUrl: './content-type-fields-type.component.html',
  styleUrls: ['./content-type-fields-type.component.scss']
})
export class ContentTypeFieldsTypeComponent implements ICellRendererAngularComp {
  value: string;
  icon: string;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    switch (this.value) {
      case 'String':
        this.icon = 'text_fields';
        break;
      case 'Entity':
        this.icon = 'share';
        break;
      case 'Boolean':
        this.icon = 'toggle_on';
        break;
      case 'Number':
        this.icon = 'dialpad';
        break;
      case 'Custom':
        this.icon = 'extension';
        break;
      case 'DateTime':
        this.icon = 'today';
        break;
      case 'Hyperlink':
        this.icon = 'link';
        break;
      case 'Empty':
        this.icon = 'crop_free';
        break;
      default:
        this.icon = 'device_unknown';
        break;
    }
  }

  refresh(params?: any): boolean {
    return true;
  }
}
