import { Metadata } from '../../metadata';

export interface Permission extends Metadata {
  Identity: string;
  Condition: string;
  Grant: string;
}
