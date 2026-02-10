import { MetadataItem } from '../../metadata';
import { VisualDesignerData } from './visual-designer-data';

/**
 * DataSource definition with it's name, type, etc.
 */
export interface DataSourceDefinition {
  Description: string;
  EntityGuid: string;
  EntityId: number;
  Metadata?: MetadataItem[];
  Name: string;
  PartAssemblyAndType: string;
  VisualDesignerData: VisualDesignerData;
}
