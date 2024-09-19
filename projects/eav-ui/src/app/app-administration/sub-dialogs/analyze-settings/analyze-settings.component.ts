import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { View } from '../../models';
import { ViewsService } from '../../services';
import { AnalyzeSettingsService } from '../../services/analyze-settings.service';
import { AnalyzeSettingsKeyComponent } from './analyze-settings-key/analyze-settings-key.component';
import { AnalyzeSettingsTotalResultsComponent } from './analyze-settings-total-results/analyze-settings-total-results.component';
import { AnalyzeSettingsTotalResultsParams } from './analyze-settings-total-results/analyze-settings-total-results.models';
import { AnalyzeSettingsValueComponent } from './analyze-settings-value/analyze-settings-value.component';
import { AnalyzePart, SettingsStackItem } from './analyze-settings.models';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { transient } from '../../../core';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-analyze-settings',
  templateUrl: './analyze-settings.component.html',
  styleUrls: ['./analyze-settings.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    SxcGridModule,
  ],
})
export class AnalyzeSettingsComponent implements OnInit {
  part: AnalyzePart;
  gridOptions = this.buildGridOptions();

  #viewsSvc = transient(ViewsService);
  #analyzeSettingsSvc = transient(AnalyzeSettingsService);
  #dialogRouter = transient(DialogRoutingService);

  views = signal<View[]>([]);
  selectedView = signal<string>(undefined);
  stack = signal<SettingsStackItem[]>([]);

  constructor(
    private dialogRef: MatDialogRef<AnalyzeSettingsComponent>,
  ) {
    this.part = this.#dialogRouter.getParam('part') as AnalyzePart;
  }

  ngOnInit(): void {
    this.getViews();
    this.getStack();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  changeView(viewGuid: string): void {
    this.selectedView.set(viewGuid);
    this.getStack();
  }

  private getViews(): void {
    this.#viewsSvc.getAll().subscribe(views => {
      this.views.set(views);
    });
  }

  private getStack(): void {
    this.#analyzeSettingsSvc.getStack(this.part, undefined, this.selectedView(), true).subscribe(stack => {
      this.stack.set(stack);
    });
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
          headerName: 'Total',
          field: 'TotalResults',
          width: 72,
          headerClass: 'dense',
          cellClass: 'secondary-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
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
