import { cloneDeep } from 'lodash-es';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { DataSourceDefinition } from '../models/data-source-definition';
import { DataSourceInstance } from '../models/data-source-instance.model';
import { StreamWire } from '../models/stream-wire';
import { VisualDesignerDataForQuery, VisualDesignerDataForSource } from '../models/visual-designer-data';
import { VisualQueryModel } from '../models/visual-query.model';
import { VisualQueryStateService } from './visual-query.service';

export class QueryDataSourceEditor {
  constructor(private stateSvc: VisualQueryStateService) {
  }

  #updatePipelineFind(pipelineDataSourceGuid: string, updateFn: (query: VisualQueryModel, dataSource: DataSourceDefinition) => VisualQueryModel) {
    this.stateSvc.pipelineModel.update(query => {
      query = cloneDeep(query);
      const dataSource = query.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
      return updateFn(query, dataSource);
    });
  }

  #updatePipeline(updateFn: (query: VisualQueryModel) => VisualQueryModel) {
    this.stateSvc.pipelineModel.update(query => updateFn(cloneDeep(query)));
  }

  showDataSourceDetails(showDetails: boolean) {
    this.#updatePipeline(query => {
      const designerData: VisualDesignerDataForQuery = JsonHelpers.tryParse(query.Pipeline.VisualDesignerData) ?? {};
      designerData.ShowDataSourceDetails = showDetails;
      query.Pipeline.VisualDesignerData = JSON.stringify(designerData);
      return query;
    });
  }
  

  renameDataSource(pipelineDataSourceGuid: string, name: string) {
    this.#updatePipelineFind(pipelineDataSourceGuid, (query, dataSource) => {
      dataSource.Name = name;
      return query;
    });
  }


  add(dataSource: DataSourceInstance) {
    this.#updatePipeline(query => {
      query.DataSources.push({
        Description: '',
        EntityGuid: 'unsaved' + (query.DataSources.length + 1),
        EntityId: undefined,
        Name: dataSource.Name,
        PartAssemblyAndType: dataSource.PartAssemblyAndType,
        VisualDesignerData: { Top: 100, Left: 100 },
      } satisfies DataSourceDefinition);
      return query;
    });
  }

  removeDataSource(pipelineDataSourceGuid: string, connections: StreamWire[], streamsOut: string) {
    this.#updatePipeline(query => {
      query.DataSources = query.DataSources.filter(pipelineDS => pipelineDS.EntityGuid !== pipelineDataSourceGuid);
      query.Pipeline.StreamWiring = connections;
      query.Pipeline.StreamsOut = streamsOut;
      return query;
    });
  }


  changeDataSourceDescription(pipelineDataSourceGuid: string, description: string) {
    this.#updatePipelineFind(pipelineDataSourceGuid, (query, dataSource) => {
      dataSource.Description = description;
      return query;
    });
  }

  changeDataSourcePosition(pipelineDataSourceGuid: string, position: VisualDesignerDataForSource) {
    this.#updatePipelineFind(pipelineDataSourceGuid, (query, dataSource) => {
      // spm NOTE: fixes problem where dataSource position can't be updated if dataSource with guid unsavedXX gets saved while dragging.
      // Can happen if dataSource is just added and user drags it and save happens.
      if (!dataSource)
        return query;
      dataSource.VisualDesignerData = { ...dataSource.VisualDesignerData, ...position };
      return query;
    });
  }

}