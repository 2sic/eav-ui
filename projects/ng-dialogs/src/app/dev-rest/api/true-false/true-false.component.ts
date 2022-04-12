import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { TrueFalseParams } from './true-false.models';

@Component({
  selector: 'app-rest-api-true-false',
  templateUrl: './true-false.component.html',
})
export class TrueFalseComponent implements ICellRendererAngularComp {
  icon: string;

  private trueIcon = 'check_circle';
  private falseIcon = 'circle';

  agInit(params: TrueFalseParams) {
    let value = params.value;
    if (params.reverse) { value = !value; }
    if (params.trueIcon) { this.trueIcon = params.trueIcon; }
    if (params.falseIcon) { this.falseIcon = params.falseIcon; }
    this.icon = value ? this.trueIcon : this.falseIcon;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
