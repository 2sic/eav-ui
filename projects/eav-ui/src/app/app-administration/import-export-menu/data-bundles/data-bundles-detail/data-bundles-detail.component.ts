import { GridOptions } from '@ag-grid-community/core';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { transient } from 'projects/core';
import { ContentItem } from 'projects/eav-ui/src/app/content-items/models/content-item.model';
import { ColumnDefinitions } from 'projects/eav-ui/src/app/shared/ag-grid/column-definitions';
import { defaultGridOptions } from 'projects/eav-ui/src/app/shared/constants/default-grid-options.constants';
import { SxcGridModule } from 'projects/eav-ui/src/app/shared/modules/sxc-grid-module/sxc-grid.module';
import { switchMap, tap } from 'rxjs';
import { DataBundlesService } from '../data-bundles-query.service';
import { DataBundlesDetailActionsComponent } from './data-bundles-detail-actions/data-bundles-detail-actions.component';
import { DataBundlesDetailActionsParams } from './data-bundles-detail-actions/data-bundles-detail-actions.models';

@Component({
  selector: 'app-data-bundles-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    SxcGridModule,
  ],
  templateUrl: './data-bundles-detail.component.html',
  styleUrl: './data-bundles-detail.component.scss'
})
export class DataBundlesDetailComponent {

  #dataBundlesService = transient(DataBundlesService);
  dataBundles = signal<ContentItem[]>(null);
  dataBundleName = signal<string>(null);


  constructor(
    private dialog: MatDialogRef<DataBundlesDetailComponent>,
    private route: ActivatedRoute
  ) { }

  gridOptions = this.#buildGridOptions();

  ngOnInit() {
    this.route.params
      .pipe(
        tap(params => {
          this.dataBundleName.set(params.name);
        }),
        switchMap(params => this.#dataBundlesService.fetchQuery(params.guid)),
        tap(d => this.dataBundles.set(d))
      )
      .subscribe();
  }

  closeDialog() {
    this.dialog.close();
  }

  #deleteItem(item: ContentItem) {
    console.log(item);
    alert('remove not yet implemented');
  }

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Title',
          field: 'Title',
          flex: 2,
        },
        {
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Typename',
          field: 'TypeName',
          flex: 2,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight3,
          cellRenderer: DataBundlesDetailActionsComponent,
          cellRendererParams: (() => {
            const params: DataBundlesDetailActionsParams = {
              do: (verb, item) => {
                switch (verb) {
                  case 'delete': this.#deleteItem(item); break;
                }
              }
            } satisfies DataBundlesDetailActionsParams;
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }

}
