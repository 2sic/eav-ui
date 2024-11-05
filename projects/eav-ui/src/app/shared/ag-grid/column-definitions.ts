import { ColDef } from '@ag-grid-community/core';
import { App } from '../../apps-management/models/app.model';
import { TrueFalseComponent } from '../../dev-rest/api/true-false/true-false.component';
import { TrueFalseParams } from '../../dev-rest/api/true-false/true-false.models';
import { BooleanFilterComponent } from '../components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../components/id-field/id-field.component';
import { IdFieldParams } from '../components/id-field/id-field.models';
import { AgBoolIconRenderer } from './apps-list-show/ag-bool-icon-renderer.component';

const cellClassSecAction = 'secondary-action no-padding'.split(' ');

const actionsRight: ColDef = {
  cellClass: cellClassSecAction,
  pinned: 'right',
};

const textSortFilter: ColDef = {
  sortable: true,
  filter: 'agTextColumnFilter',
};

export class ColumnDefinitions {
  static ActionsPinnedRight1: ColDef = {
    width: 42,
    ...actionsRight,
  };

  static ActionsPinnedRight3: ColDef = {
    width: 122,
    ...actionsRight,
  };

  static ActionsPinnedRight4: ColDef = {
    width: 162,
    ...actionsRight,
  };

  static ActionsPinnedRight5: ColDef = {
    width: 202,
    ...actionsRight,
  };

  // TODO: the name here is wrong - 6 indicates 6 buttons, but the size wouldn't allow this
  static ActionsPinnedRight6: ColDef = {
    width: 82,
    ...actionsRight,
  };

  // TODO: the name here is wrong - 7 indicates 6 buttons, but the size wouldn't allow this
  static ActionsPinnedRight7: ColDef = {
    width: 62,
    cellClass: cellClassSecAction + ' no-outline',
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
    cellClass: cellClassSecAction,
    sortable: true,
    filter: 'agNumberColumnFilter',
  };

  static ItemsText: ColDef = {
    width: 102,
    headerClass: 'dense',
    cellClass: cellClassSecAction,
    sortable: true,
    filter: 'agTextColumnFilter',
  };

  static Fields: ColDef = {
    width: 94,
    headerClass: 'dense',
    cellClass: cellClassSecAction,
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
    ...textSortFilter,
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

  static IdWithDefaultRenderer: ColDef = {
    ...ColumnDefinitions.Id,
    cellRenderer: IdFieldComponent,
  }

  static Boolean: ColDef = {
    width: 70,
    headerClass: 'dense',
    cellClass: 'number-cell no-outline'.split(' '),
    sortable: true,
  };

  static Boolean2: ColDef = {
    width: 100,
    sortable: true,
    cellClass: 'no-outline',
    filter: BooleanFilterComponent,
  };

  static Boolean3: ColDef = {
    headerClass: 'dense',
    width: 80,
    cellClass: 'no-outline',
    cellRenderer: TrueFalseComponent,
    cellRendererParams: (() => ({
      reverse: false,
    } satisfies TrueFalseParams))(),
  }

  /**
   * Very narrow ID column, with typical header name and label etc.
   */
  static Number: ColDef = {
    width: 70,
    headerClass: 'dense',
    cellClass: 'number-cell no-outline'.split(' '),
    ...textSortFilter,
  };

  static Number2: ColDef = {
    width: 110,
    headerClass: 'dense',
    cellClass: 'number-cell no-outline'.split(' '),
    ...textSortFilter,
  };

  static TextWidePrimary: ColDef = {
    flex: 3,
    minWidth: 250,
    cellClass: 'primary-action highlight'.split(' '),
    ...textSortFilter,
  };

  static TextWide: ColDef = {
    flex: 2,
    minWidth: 250,
    cellClass: 'no-outline',
    ...textSortFilter,
  };

  static TextWideMin100: ColDef = {
    flex: 1,
    minWidth: 100,
    ...textSortFilter,
  }

  static TextWideFlex3: ColDef = {
    flex: 3,
    minWidth: 250,
    cellClass: 'no-outline',
    ...textSortFilter,
  };

  static TextNarrow: ColDef = {
    flex: 1,
    minWidth: 150,
    cellClass: 'no-outline',
    ...textSortFilter,
  };

  static TextWideActionClass: ColDef = {
    flex: 2,
    minWidth: 250,
    cellClass: 'primary-action no-padding no-outline'.split(' '),
    ...textSortFilter,
  };

  static idFieldParamsTooltipGetter<T extends { Id: string | number, Guid?: string }>(key?: keyof T): IdFieldParams<T> {
    const objWithTooltipGetter: IdFieldParams<T> = {
      tooltipGetter: (contentType: T) => `ID: ${contentType.Id}\nGUID: ${contentType[key || "Guid"]}`,
    };
    return objWithTooltipGetter;
  }
}
