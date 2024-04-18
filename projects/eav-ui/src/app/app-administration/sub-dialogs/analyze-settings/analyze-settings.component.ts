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
import { AgGridModule } from '@ag-grid-community/angular';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';

@Component({
    selector: 'app-analyze-settings',
    templateUrl: './analyze-settings.component.html',
    styleUrls: ['./analyze-settings.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        SharedComponentsModule,
        MatIconModule,
        RouterOutlet,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        MatOptionModule,
        AgGridModule,
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

  constructor(
    private dialogRef: MatDialogRef<AnalyzeSettingsComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private viewsService: ViewsService,
    private analyzeSettingsService: AnalyzeSettingsService,
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
          field: 'Key',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const item: SettingsStackItem = params.data;
            return item.Path;
          },
          cellRenderer: AnalyzeSettingsKeyComponent,
        },
        {
          field: 'Value',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const item: SettingsStackItem = params.data;
            return item._value;
          },
          cellRenderer: AnalyzeSettingsValueComponent,
        },
        {
          field: 'Source',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const item: SettingsStackItem = params.data;
            return item.Source;
          },
        },
        {
          field: 'Total',
          width: 72,
          headerClass: 'dense',
          cellClass: 'secondary-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const item: SettingsStackItem = params.data;
            return item.TotalResults;
          },
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
