export interface IdFieldParams<T = unknown> {
  tooltipGetter(data: T): string;
}