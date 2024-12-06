import { GridOptions } from '@ag-grid-community/core';
import { Component, computed, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../../core';
import { SiteLanguagePermissions } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { LanguagesPermissionsActionsComponent } from './languages-permissions-actions/languages-permissions-actions.component';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions/languages-permissions-actions.models';

@Component({
    selector: 'app-language-permissions',
    templateUrl: './language-permissions.component.html',
    imports: [
        MatButtonModule,
        MatIconModule,
        RouterOutlet,
        MatDialogActions,
        SxcGridModule,
    ]
})
export class LanguagePermissionsComponent implements OnInit {
  gridOptions: GridOptions = this.#buildGridOptions();


  #zoneSvc = transient(ZoneService);
  #dialogRouting = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<LanguagePermissionsComponent>,
  ) { }

  #refresh = signal(0);

  languages = computed(() => {
    const r = this.#refresh();
    return this.#zoneSvc.getLanguagesPermissions(undefined);
  })

  ngOnInit(): void {
    this.#dialogRouting.doOnDialogClosed(() => {
      this.#refresh.set(this.#refresh() + 1);
    });

  }

  closeDialog(): void {
    this.dialog.close();
  }

  openPermissions(language: SiteLanguagePermissions): void {
    this.#dialogRouting.navRelative([GoToPermissions.getUrlLanguage(language.NameId)]);
  }


  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          field: 'Code',
          filter: 'agTextColumnFilter',
          cellRendererParams: (() => {
            const params: IdFieldParams<SiteLanguagePermissions> = {
              tooltipGetter: (language) => `ID: ${language.Code}`,
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          sort: 'asc',
          valueGetter: (p: { data: SiteLanguagePermissions }) => p.data.Culture,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight1,
          cellRenderer: LanguagesPermissionsActionsComponent,
          cellRendererParams: (() => {
            const params: LanguagesPermissionsActionsParams = {
              onOpenPermissions: (lang) => this.openPermissions(lang),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}


