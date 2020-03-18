import { Component } from '@angular/core';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';

import { BooleanFilter } from './boolean-filter.model';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrls: ['./boolean-filter.component.scss']
})
export class BooleanFilterComponent implements IFilterAngularComp {
  filter = '';

  private params: IFilterParams;

  agInit(params: IFilterParams) {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.filter !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const value: boolean = this.params.valueGetter(params.node);
    return value.toString() === this.filter;
  }

  getModel(): BooleanFilter {
    if (!this.isFilterActive()) { return; }
    return {
      filterType: 'boolean',
      filter: this.filter,
    };
  }

  setModel(model: BooleanFilter) {
    this.filter = model ? model.filter : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams) {
  }

  filterChanged() {
    this.params.filterChangedCallback();
  }
}
