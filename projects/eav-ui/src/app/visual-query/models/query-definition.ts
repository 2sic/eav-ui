import { StreamWire } from './stream-wire';


export interface QueryDefinition {
  AllowEdit: boolean;
  Description: string;
  EntityGuid: string;
  EntityId: number;
  Name: string;
  ParametersGroup: unknown;
  Params: string;
  StreamWiring: StreamWire[];
  StreamsOut: string;
  TestParameters: string;
  /** This field stores JSON */
  VisualDesignerData: string;
}
