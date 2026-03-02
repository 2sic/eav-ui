import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AgGridActionsDo } from './ag-grid-actions-signatures';

/**
 * Base component for ag-grid action components.
 * Implements common logic for initializing the component and handling actions.
 * 
 * Goal is that 90% of our action components can just extend this base and only provide the specific types and template, without needing to implement the same logic repeatedly.
 * 
 * @template TData - The type of the item being acted upon, defaulting to unknown.
 * @template TActions - The type of the actions that can be performed, used in the `do(verb, data)` method.
 * @template TParams - The type of the parameters passed to the component, extending ICellRendererParams and AgGridActionsParams.
 */
export class AgGridActionsBaseComponent<
    TData = unknown,
    TActions = unknown,
    TParams extends AgGridActionsDo<TActions, TData> = AgGridActionsDo<TActions, TData>
  > implements ICellRendererAngularComp {

  /** The item/data from the params, in case it's useful */
  public data: TData;

  /** The params as provided by the caller */
  public params: Partial<ICellRendererParams> & TParams;

  /**
   * Default implementation of the agInit method, which initializes the component with the provided parameters.
   * 
   * Can be overridden if necessary, but best make sure to call the super.agInit(params) to ensure the base logic is executed, which includes setting the data and params properties.
   * The params are expected to include a do method for performing actions, which is used in the default implementation of the do method in this base class.
   * @param params The parameters provided by the ag-Grid framework, extended with the specific action parameters.
   */
  agInit(params: ICellRendererParams & TParams): void {
    this.params = params;
    this.data = params.data;
  }

  /**
   * Default implementation of the refresh method, which is called when the grid is refreshed.
   * Can be overridden in derived components if additional logic is needed during refresh.
   *
   * @memberof AgGridActionsBaseComponent
   */
  refresh(params?: unknown): boolean {
    return true;
  }

  /**
   * Default implementation of the do method, which calls the do method from the params with the provided verb and item.
   * This method can be overridden in derived components if additional logic is needed before or after performing the action.
   * The actual implementation of the action is handled by the parent component through the do method in AgGridActionsParams.
   * @param verb must be defined in the TActions type and is used to determine which action to perform on the item.
   */
  do(verb: TActions) {
    this.params.do(verb, this.data);
  }
}
