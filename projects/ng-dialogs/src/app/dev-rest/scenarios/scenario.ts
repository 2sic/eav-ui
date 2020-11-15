export interface Scenario {
  key: string;
  useVirtual: boolean;
  inSameSite: boolean;
  inSameContext: boolean;
  in2sxc: boolean;
  name: string;
  description: string;
  notes?: string;
}
