import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { View } from '../../models';
import { ViewsService } from '../../services';
import { AnalyzeSettingsService } from '../../services/analyze-settings.service';
import { AnalyzeSettingsKeyComponent } from './analyze-settings-key/analyze-settings-key.component';
import { AnalyzeSettingsTotalResultsComponent } from './analyze-settings-total-results/analyze-settings-total-results.component';
import { AnalyzeSettingsTotalResultsParams } from './analyze-settings-total-results/analyze-settings-total-results.models';
import { AnalyzeSettingsValueComponent } from './analyze-settings-value/analyze-settings-value.component';
import { AnalyzePart, AnalyzeSettingsViewModel, SettingsStackItem } from './analyze-settings.models';
import { AsyncPipe } from '@angular/common';
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
    AsyncPipe,
    SxcGridModule,
  ],
})
export class AnalyzeSettingsComponent implements OnInit, OnDestroy {
  part: AnalyzePart;
  viewModel$: Observable<AnalyzeSettingsViewModel>;
  gridOptions = this.buildGridOptions();

  #viewsSvc = transient(ViewsService);
  #analyzeSettingsSvc = transient(AnalyzeSettingsService);
  #dialogRouter = transient(DialogRoutingService);

  #views$: BehaviorSubject<View[]>;
  #selectedView$: BehaviorSubject<string>;
  #stack$: BehaviorSubject<SettingsStackItem[]>;

  constructor(
    private dialogRef: MatDialogRef<AnalyzeSettingsComponent>,
  ) {
    this.part = this.#dialogRouter.getParam('part') as AnalyzePart;
  }

  ngOnInit(): void {
    this.#views$ = new BehaviorSubject<View[]>([]);
    this.#selectedView$ = new BehaviorSubject<string>(undefined);
    this.#stack$ = new BehaviorSubject<SettingsStackItem[]>([]);

    this.getViews();
    this.getStack();

    // TODO: @2dg - this should be easy to get rid of #remove-observables
    this.viewModel$ = combineLatest([this.#views$, this.#selectedView$, this.#stack$]).pipe(
      map(([views, selectedView, stack]) => {
        const viewModel: AnalyzeSettingsViewModel = {
          views,
          selectedView,
          stack,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    this.#views$.complete();
    this.#selectedView$.complete();
    this.#stack$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  changeView(viewGuid: string): void {
    this.#selectedView$.next(viewGuid);
    this.getStack();
  }

  private getViews(): void {
    this.#viewsSvc.getAll().subscribe(views => {
      this.#views$.next(views);
    });
  }

  private getStack(): void {
    this.#analyzeSettingsSvc.getStack(this.part, undefined, this.#selectedView$.value, true).subscribe(stack => {
      this.#stack$.next(stack);
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
                this.#dialogRouter.navRelative([`details/${this.#selectedView$.value}/${stackItem.Path}`]);
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
