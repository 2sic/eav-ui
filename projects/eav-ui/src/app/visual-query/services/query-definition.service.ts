import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { webApiQueryDataSources, webApiQueryDebugStream, webApiQueryGet, webApiQueryRun, webApiQuerySave } from '../../app-administration/services';
import { eavConstants } from '../../shared/constants/eav.constants';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { DataSourceDefinition } from '../models/data-source-definition';
import { DataSourceInstance } from '../models/data-source-instance.model';
import { QueryResult } from '../models/result/pipeline-result';
import { VisualQueryModel } from '../models/visual-query.model';
import { findDefByType } from '../plumb-editor/datasource.helpers';

@Injectable()
export class QueryDefinitionService extends HttpServiceBaseSignal {

  fetchPipelinePromise(pipelineEntityId: number, dataSources: DataSourceInstance[]): Promise<VisualQueryModel> {
    return this.fetchPromise<VisualQueryModel>(webApiQueryGet, {
      params: { appId: this.appId, id: pipelineEntityId.toString() }
    }).then(pipelineModel => {
      // if pipeline is new, populate it with default model
      if (!pipelineModel.DataSources.length) {
        this.#buildDefaultModel(pipelineModel, dataSources);
      }
      this.#fixPipelineDataSources(pipelineModel.DataSources);
      return pipelineModel;
    })
  }

  #buildDefaultModel(pipelineModel: VisualQueryModel, dataSources: DataSourceInstance[]) {
    const templateDataSources = eavConstants.pipelineDesigner.defaultPipeline.dataSources;
    for (const templateDS of templateDataSources) {
      const dataSource = findDefByType(dataSources, templateDS.PartAssemblyAndType);
      const pipelineDataSource: DataSourceDefinition = {
        Description: '',
        EntityGuid: templateDS.EntityGuid,
        EntityId: undefined,
        Name: dataSource.Name,
        PartAssemblyAndType: templateDS.PartAssemblyAndType,
        VisualDesignerData: templateDS.VisualDesignerData,
      };
      pipelineModel.DataSources.push(pipelineDataSource);
    }

    pipelineModel.Pipeline.StreamWiring = eavConstants.pipelineDesigner.defaultPipeline.streamWiring;
  }

  #fixPipelineDataSources(pipelineDataSources: DataSourceDefinition[]) {
    const outDataSourceExists = pipelineDataSources.some(
      pipelineDS => pipelineDS.EntityGuid === eavConstants.pipelineDesigner.outDataSource.EntityGuid
    );
    if (!outDataSourceExists) {
      const outDs = eavConstants.pipelineDesigner.outDataSource;
      const outDsConst: DataSourceDefinition = {
        Description: outDs.Description,
        EntityGuid: outDs.EntityGuid,
        EntityId: undefined,
        Name: outDs.Name,
        PartAssemblyAndType: outDs.PartAssemblyAndType,
        VisualDesignerData: outDs.VisualDesignerData,
      };
      pipelineDataSources.push(outDsConst);
    }

    for (const pipelineDataSource of pipelineDataSources) {
      pipelineDataSource.VisualDesignerData ??= { Top: 50, Left: 50 };
    }
  }

  fetchDataSourcesPromise(): Promise<DataSourceInstance[]> {
    return this.fetchPromise<DataSourceInstance[]>(webApiQueryDataSources, {
      params: {
        appid: this.appId,
        zoneId: this.zoneId,
      },
    }).then(dataSources => {
      // Add the final target DataSource to the list of DataSources
      dataSources.push(eavConstants.pipelineDesigner.outFinalTarget);
      return dataSources;
    })
  };

  typeNameFilter(input: string, format: 'className' | 'classFullName') {
    const globalParts = input.split(', ');

    switch (format) {
      case 'classFullName':
        const classFullName = globalParts[0];
        return classFullName;
      case 'className':
        const classFullNameParts = globalParts[0].split('.');
        const className = classFullNameParts[classFullNameParts.length - 1];
        return className;
      default:
        return input;
    }
  }

  /** Save the current query and reload entire definition as returned from server */
  savePipeline(pipelineModel: VisualQueryModel) {
    const pipeline = pipelineModel.Pipeline;
    const dataSources = pipelineModel.DataSources;

    return this.http.post<VisualQueryModel>(
      webApiQuerySave,
      { pipeline, dataSources },
      { params: { appId: this.appId, Id: pipeline.EntityId.toString() } }
    ).pipe(
      map(newPipelineModel => {
        this.#fixPipelineDataSources(newPipelineModel.DataSources);
        return newPipelineModel;
      }),
    );
  }

  /** `top` - fetch first X items */
  runPipelinePromise(id: number, top: number): Promise<QueryResult> {
    return this.fetchPromise<QueryResult>(webApiQueryRun, {
      params: { appId: this.appId, id: id.toString(), top: top.toString() }
    });
  }

  /** `top` - fetch first X items */
  debugStreamPromise(id: number, source: string, sourceOut: string, top: number): Promise<QueryResult> {
    return this.fetchPromise<QueryResult>(webApiQueryDebugStream, {
      params: { appId: this.appId, id: id.toString(), from: source, out: sourceOut, top: top.toString() }
    });
  }

}
