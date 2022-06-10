import { IFilterAngularComp } from '@ag-grid-community/angular';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams, ValueGetterParams } from '@ag-grid-community/core';
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

  private filterParams: IFilterParams;
  private idFilter: number[] = [];

  agInit(params: IFilterParams): void {
    this.filterParams = params;
  }

  isFilterActive(): boolean {
    return this.filter !== '' || this.idFilter.length > 0;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    if (this.filter !== '') {
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
      const values: string[] | undefined = this.filterParams.valueGetter(valueGetterParams);
      if (values == null) { return false; }
      if (!values.some(value => !!value && value.includes(this.filter))) { return false; }
    }

    if (this.idFilter.length > 0) {
      const items: { Id: number; Title: string; }[] | undefined = params.data[this.filterParams.colDef.headerName];
      if (items == null) { return false; }
      if (!this.idFilter.some(idFltr => items.some(itm => itm.Id === idFltr))) { return false; }
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
    this.filterParams.filterChangedCallback();
  }
}
