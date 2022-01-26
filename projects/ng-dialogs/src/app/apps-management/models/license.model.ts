import { Feature } from './feature.model';

export interface License {
  Description: string;
  Features: Feature[];
  Guid: string;
  Name: string;
  Priority: number;
}
