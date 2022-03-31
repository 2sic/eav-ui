import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams, ValueGetterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { BooleanFilterModel } from './boolean-filter.model';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrls: ['./boolean-filter.component.scss'],
})
export class BooleanFilterComponent implements IFilterAngularComp {
  filter = '';

  private filterParams: IFilterParams;

  agInit(params: IFilterParams) {
    this.filterParams = params;
  }

  isFilterActive(): boolean {
    return this.filter !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
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
    const value: boolean = this.filterParams.valueGetter(valueGetterParams);
    if (value == null) { return false; }
    return value.toString() === this.filter;
  }

  getModel(): BooleanFilterModel {
    if (!this.isFilterActive()) { return; }
    return {
      filterType: 'boolean',
      filter: this.filter,
    };
  }

  setModel(model: BooleanFilterModel) {
    this.filter = model ? model.filter : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams) {
  }

  filterChanged() {
    this.filterParams.filterChangedCallback();
  }
}
