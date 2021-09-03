import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { AnalyzeSettingsKeyComponent } from '../../ag-grid-components/analyze-settings-key/analyze-settings-key.component';
import { AnalyzeSettingsTotalResultsComponent } from '../../ag-grid-components/analyze-settings-total-results/analyze-settings-total-results.component';
import { AnalyzeSettingsTotalResultsParams } from '../../ag-grid-components/analyze-settings-total-results/analyze-settings-total-results.models';
import { AnalyzeSettingsValueComponent } from '../../ag-grid-components/analyze-settings-value/analyze-settings-value.component';
import { View } from '../../models';
import { ViewsService } from '../../services';
import { AnalyzeSettingsService } from '../../services/analyze-settings.service';
import { AnalyzePart, AnalyzeSettingsTemplateVars, SettingsStackItem } from './analyze-settings.models';

@Component({
  selector: 'app-analyze-settings',
  templateUrl: './analyze-settings.component.html',
  styleUrls: ['./analyze-settings.component.scss'],
})
export class AnalyzeSettingsComponent implements OnInit, OnDestroy {
  part: AnalyzePart;
  templateVars$: Observable<AnalyzeSettingsTemplateVars>;

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      analyzeSettingsKeyComponent: AnalyzeSettingsKeyComponent,
      analyzeSettingsValueComponent: AnalyzeSettingsValueComponent,
      analyzeSettingsTotalComponent: AnalyzeSettingsTotalResultsComponent,
    },
    columnDefs: [
      {
        headerName: 'Key', field: 'Path', flex: 2, minWidth: 250, cellClass: 'primary-action no-padding no-outline',
        cellRenderer: 'analyzeSettingsKeyComponent', sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Value', field: '_value', flex: 2, minWidth: 250, cellClass: 'primary-action no-padding no-outline',
        cellRenderer: 'analyzeSettingsValueComponent', sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Source', field: 'Source', flex: 1, minWidth: 150, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Total', field: 'TotalResults', width: 70, headerClass: 'dense', cellClass: 'secondary-action no-padding no-outline',
        cellRenderer: 'analyzeSettingsTotalComponent', sortable: true, filter: 'agNumberColumnFilter', cellRendererParams: {
          openDetails: (stackItem) => {
            this.router.navigate([`details/${this.selectedView$.value}/${stackItem.Path}`], { relativeTo: this.route });
          },
        } as AnalyzeSettingsTotalResultsParams,
      },
    ],
  };

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

    this.templateVars$ = combineLatest([this.views$, this.selectedView$, this.stack$]).pipe(
      map(([views, selectedView, stack]) => {
        const templateVars: AnalyzeSettingsTemplateVars = {
          views,
          selectedView,
          stack,
        };
        return templateVars;
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
}
