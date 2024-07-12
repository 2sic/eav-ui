import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { MatRippleModule } from '@angular/material/core';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

@Component({
  selector: 'app-analyze-settings-key',
  templateUrl: './analyze-settings-key.component.html',
  styleUrls: ['./analyze-settings-key.component.scss'],
  standalone: true,
  imports: [
    MatRippleModule,
    TippyDirective,
  ],
})
export class AnalyzeSettingsKeyComponent implements ICellRendererAngularComp {
  key: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.key = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.key);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
