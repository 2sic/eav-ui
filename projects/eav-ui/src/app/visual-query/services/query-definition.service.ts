import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { webApiQueryDataSources, webApiQueryDebugStream, webApiQueryGet, webApiQueryRun, webApiQuerySave } from '../../app-administration/services';
import { eavConstants } from '../../shared/constants/eav.constants';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { DataSource } from '../models/data-sources.model';
import { PipelineResult } from '../models/pipeline-result.model';
import { PipelineDataSource, PipelineModel } from '../models/pipeline.model';
import { findDefByType } from '../plumb-editor/datasource.helpers';

@Injectable()
export class QueryDefinitionService extends HttpServiceBaseSignal {

  fetchPipelinePromise(pipelineEntityId: number, dataSources: DataSource[]): Promise<PipelineModel> {
    return this.fetchPromise<PipelineModel>(webApiQueryGet, {
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

  #buildDefaultModel(pipelineModel: PipelineModel, dataSources: DataSource[]) {
    const templateDataSources = eavConstants.pipelineDesigner.defaultPipeline.dataSources;
    for (const templateDS of templateDataSources) {
      const dataSource = findDefByType(dataSources, templateDS.PartAssemblyAndType);
      const pipelineDataSource: PipelineDataSource = {
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

  #fixPipelineDataSources(pipelineDataSources: PipelineDataSource[]) {
    const outDataSourceExists = pipelineDataSources.some(
      pipelineDS => pipelineDS.EntityGuid === eavConstants.pipelineDesigner.outDataSource.EntityGuid
    );
    if (!outDataSourceExists) {
      const outDs = eavConstants.pipelineDesigner.outDataSource;
      const outDsConst: PipelineDataSource = {
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

  fetchDataSourcesPromise(): Promise<DataSource[]> {
    return this.fetchPromise<DataSource[]>(webApiQueryDataSources, {
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
  savePipeline(pipelineModel: PipelineModel) {
    const pipeline = pipelineModel.Pipeline;
    const dataSources = pipelineModel.DataSources;

    return this.http.post<PipelineModel>(
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
  runPipelinePromise(id: number, top: number): Promise<PipelineResult> {
    return this.fetchPromise<PipelineResult>(webApiQueryRun, {
      params: { appId: this.appId, id: id.toString(), top: top.toString() }
    });
  }

  /** `top` - fetch first X items */
  debugStreamPromise(id: number, source: string, sourceOut: string, top: number): Promise<PipelineResult> {
    return this.fetchPromise<PipelineResult>(webApiQueryDebugStream, {
      params: { appId: this.appId, id: id.toString(), from: source, out: sourceOut, top: top.toString() }
    });
  }

}
