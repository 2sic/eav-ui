import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

/**
 * Base component for generic ag-grid cell renderer components.
 * Provides typed access to row data, value and custom params.
 *
 * @template TData - The type of the row data provided by ag-Grid.
 * @template TValue - The type of the value for the current column.
 * @template TParams - Additional custom params passed to the renderer.
 */
export class AgGridCellRendererBaseComponent<
  TData = unknown,
  TValue = unknown,
  TParams = unknown
> implements ICellRendererAngularComp {

  /** Row data for the current grid row */
  public data!: TData;

  /** Cell value for the current column */
  public value!: TValue;

  /** Full params provided by ag-grid plus custom renderer params */
  public params!: ICellRendererParams<TData, TValue> & TParams;

  agInit(params: ICellRendererParams<TData, TValue> & TParams): void {
    this.params = params;
    this.data = params.data;
    this.value = params.value;
  }

  refresh(): boolean {
    return true;
  }
}