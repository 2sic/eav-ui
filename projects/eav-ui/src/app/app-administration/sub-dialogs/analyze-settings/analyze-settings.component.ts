import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
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

  private views$: BehaviorSubject<View[]>;
  private selectedView$: BehaviorSubject<string>;
  private stack$: BehaviorSubject<SettingsStackItem[]>;

  private viewsService = transient(ViewsService);
  private analyzeSettingsService = transient(AnalyzeSettingsService);

  constructor(
    private dialogRef: MatDialogRef<AnalyzeSettingsComponent>,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.part = this.route.snapshot.paramMap.get('part') as AnalyzePart;
  }

  ngOnInit(): void {
    this.views$ = new BehaviorSubject<View[]>([]);
    this.selectedView$ = new BehaviorSubject<string>(undefined);
    this.stack$ = new BehaviorSubject<SettingsStackItem[]>([]);

    this.getViews();
    this.getStack();

    this.viewModel$ = combineLatest([this.views$, this.selectedView$, this.stack$]).pipe(
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
    this.views$.complete();
    this.selectedView$.complete();
    this.stack$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  changeView(viewGuid: string): void {
    this.selectedView$.next(viewGuid);
    this.getStack();
  }

  private getViews(): void {
    this.viewsService.getAll().subscribe(views => {
      this.views$.next(views);
    });
  }

  private getStack(): void {
    this.analyzeSettingsService.getStack(this.part, undefined, this.selectedView$.value, true).subscribe(stack => {
      this.stack$.next(stack);
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
                this.router.navigate([`details/${this.selectedView$.value}/${stackItem.Path}`], { relativeTo: this.route });
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
