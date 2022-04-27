/** Generic pattern to provide actions with less ceremony */
export interface IAgActions<TAction, TData> {
  do(action: TAction, query: TData): void;
}
