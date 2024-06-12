import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';
import { JsonHelpers } from 'projects/eav-ui/src/app/shared/helpers/json.helpers';

@Component({
    selector: 'app-analyze-settings-value',
    templateUrl: './analyze-settings-value.component.html',
    styleUrls: ['./analyze-settings-value.component.scss'],
    standalone: true,
    imports: [MatRippleModule, SharedComponentsModule],
})
export class AnalyzeSettingsValueComponent implements ICellRendererAngularComp {
  value: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy(text: string) {
    text = JsonHelpers.tryParse(text) ?? text;
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
