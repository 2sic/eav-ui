import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewUsageDataStatus } from '../../models/view-usage-data.model';
import { ViewsUsageStatusFilterModel } from './views-usage-status-filter.model';

@Component({
  selector: 'app-views-usage-status-filter',
  templateUrl: './views-usage-status-filter.component.html',
  styleUrls: ['./views-usage-status-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewsUsageStatusFilterComponent implements IFilterAngularComp {
  isVisible = '';
  isDeleted = '';

  private params: IFilterParams;

  agInit(params: IFilterParams) {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.isVisible !== '' || this.isDeleted !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    let visiblePassed = false;
    let deletedPassed = false;
    const value: ViewUsageDataStatus = this.params.valueGetter(params.node);
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
    this.params.filterChangedCallback();
  }
}
