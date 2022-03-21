import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams, ValueGetterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { ViewUsageDataStatus } from '../../models/view-usage-data.model';
import { ViewsUsageStatusFilterModel } from './views-usage-status-filter.model';

@Component({
  selector: 'app-views-usage-status-filter',
  templateUrl: './views-usage-status-filter.component.html',
  styleUrls: ['./views-usage-status-filter.component.scss'],
})
export class ViewsUsageStatusFilterComponent implements IFilterAngularComp {
  isVisible = '';
  isDeleted = '';

  private filterParams: IFilterParams;

  agInit(params: IFilterParams) {
    this.filterParams = params;
  }

  isFilterActive(): boolean {
    return this.isVisible !== '' || this.isDeleted !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    let visiblePassed = false;
    let deletedPassed = false;

    const valueGetterParams: ValueGetterParams = {
      api: this.filterParams.api,
      colDef: this.filterParams.colDef,
      column: this.filterParams.column,
      columnApi: this.filterParams.columnApi,
      context: this.filterParams.context,
      data: params.node.data,
      getValue: (field) => params.node.data[field],
      node: params.node,
    };
    const value: ViewUsageDataStatus = this.filterParams.valueGetter(valueGetterParams);
    if (value == null) { return false; }
    if (this.isVisible !== '') {
      visiblePassed = (value.IsVisible == null) ? false : value.IsVisible.toString() === this.isVisible;
    } else {
      visiblePassed = true;
    }
    if (this.isDeleted !== '') {
      deletedPassed = (value.IsDeleted == null) ? false : value.IsDeleted.toString() === this.isDeleted;
    } else {
      deletedPassed = true;
    }
    return visiblePassed && deletedPassed;
  }

  getModel(): ViewsUsageStatusFilterModel {
    if (!this.isFilterActive()) { return; }
    return {
      filterType: 'views-usage-status',
      isVisible: this.isVisible,
      isDeleted: this.isDeleted,
    };
  }

  setModel(model: ViewsUsageStatusFilterModel) {
    this.isVisible = model ? model.isVisible : '';
    this.isDeleted = model ? model.isDeleted : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams) {
  }

  filterChanged() {
    this.filterParams.filterChangedCallback();
  }
}
