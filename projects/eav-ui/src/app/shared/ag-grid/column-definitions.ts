import { ColDef } from '@ag-grid-community/core';
import { BooleanFilterComponent } from '../components/boolean-filter/boolean-filter.component';
import { App } from '../../apps-management/models/app.model';
import { AgBoolIconRenderer } from './apps-list-show/ag-bool-icon-renderer.component';

export class ColumnDefinitions {
  static ActionsPinnedRight1: ColDef = {
    width: 42,
    cellClass: 'secondary-action no-padding'.split(' '),
    pinned: 'right',
  };

  static ActionsPinnedRight3: ColDef = {
    width: 122,
    cellClass: 'secondary-action no-padding'.split(' '),
    pinned: 'right',
  };

  static ActionsPinnedRight4: ColDef = {
    width: 162,
    cellClass: 'secondary-action no-padding'.split(' '),
    pinned: 'right',
  };

  static ActionsPinnedRight5: ColDef = {
    width: 202,
    cellClass: 'secondary-action no-padding'.split(' '),
    pinned: 'right',
  };

  static IconShow: ColDef = {
    headerName: 'Show',
    width: 70,
    headerClass: 'dense',
    cellClass: 'icons no-outline'.split(' '),
    sortable: true,
    filter: BooleanFilterComponent,
    valueGetter: (params) => {
      const app: App = params.data;
      return !app.IsHidden;
    },
    cellRenderer: AgBoolIconRenderer,
  };

  static Items: ColDef = {
    width: 102,
    headerClass: 'dense',
    cellClass: 'secondary-action no-padding'.split(' '),
    sortable: true,
    filter: 'agNumberColumnFilter',
  };

  static Fields: ColDef = {
    width: 94,
    headerClass: 'dense',
    cellClass: 'secondary-action no-padding'.split(' '),
    sortable: true,
    filter: 'agNumberColumnFilter',
  };

  /**
   * Very narrow columns, typically just showing 1 character
   */
  static Character: ColDef = {
    width: 70,
    headerClass: 'dense',
    cellClass: 'no-outline',
    sortable: true,
    filter: 'agTextColumnFilter',
  };

  /**
   * Very narrow ID column, with typical header name and label etc.
   */
  static Id: ColDef = {
    headerName: 'ID',
    field: 'Id',
    width: 70,
    headerClass: 'dense',
    cellClass: 'id-action no-padding no-outline'.split(' '),
    sortable: true,
    filter: 'agNumberColumnFilter',
  };

  /**
   * Very narrow ID column, with typical header name and label etc.
   */
  static Number: ColDef = {
    width: 70,
    headerClass: 'dense',
    cellClass: 'number-cell no-outline'.split(' '),
    sortable: true,
    filter: 'agNumberColumnFilter',
  };

  static TextWideType: ColDef = {
    flex: 3,
    minWidth: 250,
    cellClass: 'primary-action highlight'.split(' '),
    sortable: true,
    filter: 'agTextColumnFilter',
  };

  static TextWide: ColDef = {
    flex: 2,
    minWidth: 250,
    cellClass: 'no-outline',
    sortable: true,
    filter: 'agTextColumnFilter',
  };

  static TextWideMin100: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
  }

  static TextWideFlex3: ColDef = {
    flex: 3,
    minWidth: 250,
    cellClass: 'no-outline',
    sortable: true,
    filter: 'agTextColumnFilter',
  };

  static TextNarrow: ColDef = {
    flex: 1,
    minWidth: 150,
    cellClass: 'no-outline',
    sortable: true,
    filter: 'agTextColumnFilter',
  };

}
