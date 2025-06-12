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
export class SettingsItemDetailsComponent implements OnInit {
  part: Of<typeof AnalyzeParts>;
  selectedView: string;
  settingsItemKey: string;


  private analyzeSettingsService = transient(AnalyzeSettingsService);
  stack = signal<SettingsStackItem[]>(undefined);

  // TODO: 2dg not works
  // #routeParams = signal<AnalyzeRouteParams | undefined>(undefined);

  // stack2 = computed(() => {
  //   const params = this.#routeParams();
  //   if (!params) return []; // Return empty array or appropriate default
  //   const { part, settingsItemKey, selectedView } = params;
  //   // Assuming getStackSig returns a signal, we need to invoke it to get the value
  //   const stackSignal = this.analyzeSettingsService.getStackSig(part, settingsItemKey, selectedView);
  //   // console.log('stackSignal', stackSignal());
  //   return stackSignal.value(); // Return the actual stack items
  // });

  gridOptions = this.buildGridOptions();

  constructor(
    private dialog: MatDialogRef<SettingsItemDetailsComponent>,
    private route: ActivatedRoute,
  ) {
    // Capture route parameters
    this.part = this.route.snapshot.parent.paramMap.get('part') as Of<typeof AnalyzeParts>;
    const routeViewGuid = this.route.snapshot.paramMap.get('view');
    this.selectedView = ['undefined', 'null'].includes(routeViewGuid) ? undefined : routeViewGuid;
    this.settingsItemKey = this.route.snapshot.paramMap.get('settingsItemKey');
  
    // TODO: 2dg not works
    // // Set route parameters
    // this.#routeParams.set({
    //   part: this.part,
    //   selectedView: this.selectedView,
    //   settingsItemKey: this.settingsItemKey,
    // });

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
