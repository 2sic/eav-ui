import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/all-modules';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { EntityFilterModel } from './entity-filter.model';

@Component({
  selector: 'app-entity-filter',
  templateUrl: './entity-filter.component.html',
  styleUrls: ['./entity-filter.component.scss'],
})
export class EntityFilterComponent implements IFilterAngularComp {
  @ViewChild('valueInput') private valueInputRef: ElementRef<HTMLInputElement>;

  filter = '';
  idFilterString = '';

  private params: IFilterParams;
  private idFilter: number[];

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.filter !== '' || this.idFilter.length > 0;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    if (this.filter !== '') {
      const values: string[] | undefined = this.params.valueGetter(params.node);
      if (values == null) { return false; }
      if (!values.some(value => !!value && value.includes(this.filter))) { return false; }
    }

    if (this.idFilter.length > 0) {
      const item: { Id: number; Title: string; } | undefined = params.data[this.params.colDef.headerName]?.[0];
      if (item == null) { return false; }
      if (!this.idFilter.includes(item.Id)) { return false; }
    }

    return true;
  }

  getModel(): EntityFilterModel {
    if (!this.isFilterActive()) { return; }
    const model: EntityFilterModel = {
      filterType: 'entity',
      filter: this.filter,
      idFilter: this.idFilter,
    };
    return model;
  }

  setModel(model: EntityFilterModel): void {
    this.filter = model?.filter ?? '';
    this.idFilter = model?.idFilter ?? [];
    this.idFilterString = model?.idFilter?.join(',') ?? '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams): void {
    this.valueInputRef.nativeElement.focus();
  }

  updateIdFilter(): void {
    this.idFilter = this.idFilterString.split(',').map(el => parseInt(el, 10)).filter(el => !isNaN(el));
  }

  filterChanged(): void {
    this.params.filterChangedCallback();
  }
}
