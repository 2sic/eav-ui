import { GridOptions } from '@ag-grid-community/core';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { Of, transient } from '../../../../../../core';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { ViewsService } from '../../services';
import { AnalyzeSettingsService } from '../../services/analyze-settings.service';
import { AnalyzeSettingsKeyComponent } from './analyze-settings-key/analyze-settings-key.component';
import { AnalyzeSettingsTotalResultsComponent } from './analyze-settings-total-results/analyze-settings-total-results.component';
import { AnalyzeSettingsTotalResultsParams } from './analyze-settings-total-results/analyze-settings-total-results.models';
import { AnalyzeSettingsValueComponent } from './analyze-settings-value/analyze-settings-value.component';
import { AnalyzeParts } from './analyze-settings.models';

@Component({
  selector: 'app-analyze-settings',
  templateUrl: './analyze-settings.component.html',
  styleUrls: ['./analyze-settings.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    SxcGridModule,
  ]
})
export class AnalyzeSettingsComponent implements OnInit {
  gridOptions = this.buildGridOptions();

  #viewsSvc = transient(ViewsService);
  #analyzeSettingsSvc = transient(AnalyzeSettingsService);
  #dialogRouter = transient(DialogRoutingService);

  part: Of<typeof AnalyzeParts> = this.#dialogRouter.getParam('part') as Of<typeof AnalyzeParts>;

  constructor(
    private dialog: MatDialogRef<AnalyzeSettingsComponent>,
  ) {}

  selectedView = signal<string>(undefined);
  views = this.#viewsSvc.getAllOnce().value;

  #stackSignal = this.#analyzeSettingsSvc.getStack(this.part, undefined, this.selectedView()).value;

  stack = computed(() => {
    const stackItems = this.#stackSignal();
    return stackItems?.map(item => ({
      ...item,
      _value: JSON.stringify(item.Value)
    }));
  });

  ngOnInit(): void {
    this.#getStack();
  }

  closeDialog(): void {
    this.dialog.close();
  }

  changeView(viewGuid: string): void {
    this.selectedView.set(viewGuid);
    this.#getStack();
  }


  #getStack(): void {
    this.stack();
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Key',
          field: 'Path',
          cellRenderer: AnalyzeSettingsKeyComponent,
        },
        {
          ...ColumnDefinitions.TextWideActionClass,
          headerName: 'Value',
          field: '_value',
          cellRenderer: AnalyzeSettingsValueComponent,
        },
        {
          field: 'Source',
          ...ColumnDefinitions.TextNarrow,
        },
        {
          ...ColumnDefinitions.Items,
          headerName: 'Total',
          field: 'TotalResults',
          width: 72,
          cellClass: 'no-outline',

          cellRenderer: AnalyzeSettingsTotalResultsComponent,
          cellRendererParams: (() => {
            const params: AnalyzeSettingsTotalResultsParams = {
              openDetails: (stackItem) => {
                this.#dialogRouter.navRelative([`details/${this.selectedView()}/${stackItem.Path}`]);
              },
            };
            return params;
          })(),
        },

      ],
    };
    return gridOptions;
  }
}
