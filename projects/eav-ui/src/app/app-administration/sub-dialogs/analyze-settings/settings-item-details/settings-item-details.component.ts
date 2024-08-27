import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { defaultGridOptions } from '../../../../shared/constants/default-grid-options.constants';
import { AnalyzeSettingsService } from '../../../services/analyze-settings.service';
import { AnalyzeSettingsValueComponent } from '../analyze-settings-value/analyze-settings-value.component';
import { AnalyzePart, SettingsStackItem } from '../analyze-settings.models';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SxcGridModule } from '../../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { ColumnDefinitions } from '../../../../shared/ag-grid/column-definitions';
import { transient } from '../../../../core';

@Component({
  selector: 'app-settings-item-details',
  templateUrl: './settings-item-details.component.html',
  styleUrls: ['./settings-item-details.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    SxcGridModule,
  ],
})
export class SettingsItemDetailsComponent implements OnInit, OnDestroy {
  part: AnalyzePart;
  selectedView: string;
  settingsItemKey: string;
  stack$: BehaviorSubject<SettingsStackItem[]>;
  gridOptions = this.buildGridOptions();

  viewModel$: Observable<SettingsItemDetailsViewModel>;

  private analyzeSettingsService = transient(AnalyzeSettingsService);

  constructor(
    private dialogRef: MatDialogRef<SettingsItemDetailsComponent>,
    private route: ActivatedRoute,
  ) {
    this.part = this.route.snapshot.parent.paramMap.get('part') as AnalyzePart;
    const routeViewGuid = this.route.snapshot.paramMap.get('view');
    this.selectedView = ['undefined', 'null'].includes(routeViewGuid) ? undefined : routeViewGuid;
    this.settingsItemKey = this.route.snapshot.paramMap.get('settingsItemKey');
  }

  ngOnInit(): void {
    this.stack$ = new BehaviorSubject<SettingsStackItem[]>(undefined);
    this.analyzeSettingsService.getStack(this.part, this.settingsItemKey, this.selectedView, true).subscribe(stack => {
      this.stack$.next(stack);
    });
    this.viewModel$ = combineLatest([this.stack$]).pipe(
      map(([stack]) => ({ stack }))
    );
  }

  ngOnDestroy(): void {
    this.stack$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
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

interface SettingsItemDetailsViewModel {
  stack: SettingsStackItem[];
}
