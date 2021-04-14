import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TrueFalseParams } from './true-false-column-params';

@Component({
  selector: 'app-rest-api-true-false',
  templateUrl: './true-false.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrueFalseComponent implements ICellRendererAngularComp {
  value: boolean;

  reverse: boolean;
  trueIcon: string = 'check_circle';
  falseIcon: string = 'circle';

  icon: string;

  agInit(params: TrueFalseParams) {
    this.value = params.value;
    if(params.reverse) this.value = !this.value;
    if(params.trueIcon) this.trueIcon = params.trueIcon;
    if(params.falseIcon) this.falseIcon = params.falseIcon;
    this.icon = this.value ? this.trueIcon : this.falseIcon;
  }

  // 2dm @SPM - what is this for ?
  refresh(params?: any): boolean {
    return true;
  }
}

