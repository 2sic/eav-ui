import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal } from '@angular/core';
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
import { AnalyzeParts, SettingsStackItem } from '../analyze-settings.models';

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
export class SettingsItemDetailsComponent implements OnInit {
  part: Of<typeof AnalyzeParts>;
  selectedView: string;
  settingsItemKey: string;

  stack = signal<SettingsStackItem[]>(undefined);

  gridOptions = this.buildGridOptions();

  private analyzeSettingsService = transient(AnalyzeSettingsService);

  constructor(
    private dialog: MatDialogRef<SettingsItemDetailsComponent>,
    private route: ActivatedRoute,
  ) {
    this.part = this.route.snapshot.parent.paramMap.get('part') as Of<typeof AnalyzeParts>;
    const routeViewGuid = this.route.snapshot.paramMap.get('view');
    this.selectedView = ['undefined', 'null'].includes(routeViewGuid) ? undefined : routeViewGuid;
    this.settingsItemKey = this.route.snapshot.paramMap.get('settingsItemKey');
  }

  ngOnInit(): void {
    this.analyzeSettingsService.getStack(this.part, this.settingsItemKey, this.selectedView, true).subscribe(stack => {
      this.stack.set(stack);
    });
  }

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
