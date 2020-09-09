import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';

import { BooleanFilterModel } from './boolean-filter.model';

@Component({
  selector: 'app-boolean-filter',
  templateUrl: './boolean-filter.component.html',
  styleUrls: ['./boolean-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    if (value === null || value === undefined) { return false; }
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
    this.params.filterChangedCallback();
  }
}
