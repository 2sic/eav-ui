import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { defaultGridOptions } from '../../../../shared/constants/default-grid-options.constants';
import { AnalyzeSettingsService } from '../../../services/analyze-settings.service';
import { AnalyzeSettingsValueComponent } from '../analyze-settings-value/analyze-settings-value.component';
import { AnalyzePart, SettingsStackItem } from '../analyze-settings.models';

@Component({
  selector: 'app-settings-item-details',
  templateUrl: './settings-item-details.component.html',
  styleUrls: ['./settings-item-details.component.scss'],
})
export class SettingsItemDetailsComponent implements OnInit, OnDestroy {
  part: AnalyzePart;
  selectedView: string;
  settingsItemKey: string;
  stack$: BehaviorSubject<SettingsStackItem[]>;
  gridOptions = this.buildGridOptions();

  constructor(
    private dialogRef: MatDialogRef<SettingsItemDetailsComponent>,
    private route: ActivatedRoute,
    private analyzeSettingsService: AnalyzeSettingsService,
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
      ],
    };
    return gridOptions;
  }
}
