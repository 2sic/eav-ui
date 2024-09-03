
export interface LogSpecs<T> {
  name: string;
  enabled: boolean;
  enableChildren?: boolean;
  specs?: T;
}
