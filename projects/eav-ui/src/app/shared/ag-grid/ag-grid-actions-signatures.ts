/**
 * Standard parameters for ag-grid action components.
 * 
 * By default it will just include a do method, which takes a verb (the action to perform) and the item (the data from the row) as parameters.
 * The actual implementation of the do method is provided by the parent component that uses the action component in the grid,
 * allowing for flexibility in how actions are handled while keeping the action components themselves simple and reusable.
 * 
 * Note that the verb parameter must be defined, to ensure that no unexpected verbs are used at compile time.
 */
export interface AgGridActionsDo<TDoActions, TData = unknown> {
  do(verb: TDoActions, item: TData): void;
}


export interface AgGridActionsUrlTo<TUrlActions, TData = unknown> {
  urlTo(verb: TUrlActions, item: TData): string;
}

export interface AgGridActionsDoAndUrlTo<TDoActions, TUrlActions, TData = unknown>
  extends
    AgGridActionsDo<TDoActions, TData>,
    AgGridActionsUrlTo<TUrlActions, TData> {    
}