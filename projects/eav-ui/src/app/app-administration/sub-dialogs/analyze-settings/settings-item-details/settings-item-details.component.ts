import { GridOptions } from '@ag-grid-community/core';
import { Component, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Of, transient } from '../../../../../../../core';
import { ColumnDefinitions } from '../../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { AnalyzeSettingsService } from '../../../services/analyze-settings.service';
import { AnalyzeSettingsValueComponent } from '../analyze-settings-value/analyze-settings-value.component';
import { AnalyzeParts } from '../analyze-settings.models';
// TODO: 2dg not works
// interface AnalyzeRouteParams {
//   part: Of<typeof AnalyzeParts>;
//   selectedView: string;
//   settingsItemKey: string;
// }

@Component({
  selector: 'app-settings-item-details',
  templateUrl: './settings-item-details.component.html',
  styleUrls: ['./settings-item-details.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    SxcGridModule,
  ]
})
export class SettingsItemDetailsComponent {

  #analyzeSettingsSvc = transient(AnalyzeSettingsService);
  gridOptions = this.buildGridOptions();

  part: Of<typeof AnalyzeParts> = this.route.snapshot.parent.paramMap.get('part') as Of<typeof AnalyzeParts>;
  routeViewGuid = this.route.snapshot.paramMap.get('view');
  selectedView: string = ['undefined', 'null'].includes(this.routeViewGuid) ? undefined : this.routeViewGuid;;
  settingsItemKey: string = this.route.snapshot.paramMap.get('settingsItemKey');;


  constructor(
    private dialog: MatDialogRef<SettingsItemDetailsComponent>,
    private route: ActivatedRoute,
  ) { }

  #stackSignal = this.#analyzeSettingsSvc.getStack(this.part, undefined, this.selectedView).value;

  stack = computed(() => {
    const stackItems = this.#stackSignal();
    return stackItems?.map(item => ({
      ...item,
      _value: JSON.stringify(item.Value)
    }));
  });

  closeDialog(): void {
    this.dialog.close();
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Value',
          field: '_value',
          cellRenderer: AnalyzeSettingsValueComponent,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          field: 'Source',
        },
      ],
    };
    return gridOptions;
  }
}
