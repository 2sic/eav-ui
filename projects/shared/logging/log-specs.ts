
export interface LogSpecs<T extends unknown = unknown> {
  name: string;
  enabled: boolean;
  enableChildren?: boolean;
  specs?: T;
}
