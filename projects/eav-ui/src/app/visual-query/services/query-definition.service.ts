import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { webApiQueryDataSources, webApiQueryDebugStream, webApiQueryGet, webApiQueryRun, webApiQuerySave } from '../../app-administration/services';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DataSource, PipelineDataSource, PipelineModel, PipelineResult } from '../models';

@Injectable()
export class QueryDefinitionService {
  constructor(private http: HttpClient, private context: Context) { }

  fetchPipeline(pipelineEntityId: number, dataSources: DataSource[]) {
    return this.http.get<PipelineModel>(webApiQueryGet, {
      params: { appId: this.context.appId.toString(), id: pipelineEntityId.toString() }
    }).pipe(
      map(pipelineModel => {
        // if pipeline is new, populate it with default model
        if (!pipelineModel.DataSources.length) {
          this.buildDefaultModel(pipelineModel, dataSources);
        }
        this.fixPipelineDataSources(pipelineModel.DataSources);
        return pipelineModel;
      }),
    );
  }

  private buildDefaultModel(pipelineModel: PipelineModel, dataSources: DataSource[]) {
    const templateDataSources = eavConstants.pipelineDesigner.defaultPipeline.dataSources;
    for (const templateDS of templateDataSources) {
      const dataSource = dataSources.find(ds => ds.PartAssemblyAndType === templateDS.PartAssemblyAndType);
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

  private fixPipelineDataSources(pipelineDataSources: PipelineDataSource[]) {
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

  fetchDataSources() {
    return this.http.get<DataSource[]>(webApiQueryDataSources, {
      params: {
        appid: this.context.appId,
        zoneId: this.context.zoneId,
      },
    }).pipe(
      map(dataSources => {
        const outDs = eavConstants.pipelineDesigner.outDataSource;
        const outDsConst: DataSource = {
          ContentType: undefined,
          Difficulty: eavConstants.pipelineDesigner.dataSourceDifficulties.default,
          DynamicIn: true,
          DynamicOut: false,
          EnableConfig: undefined,
          HelpLink: undefined,
          Icon: undefined,
          In: outDs.In,
          Name: outDs.Name,
          Out: undefined,
          PartAssemblyAndType: outDs.PartAssemblyAndType,
          PrimaryType: outDs.PrimaryType,
          TypeNameForUi: undefined,
          UiHint: undefined,
        };
        dataSources.push(outDsConst);
        return dataSources;
      }),
    );
  }

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
      { params: { appId: this.context.appId.toString(), Id: pipeline.EntityId.toString() } }
    ).pipe(
      map(newPipelineModel => {
        this.fixPipelineDataSources(newPipelineModel.DataSources);
        return newPipelineModel;
      }),
    );
  }

  /** `top` - fetch first X items */
  runPipeline(id: number, top: number) {
    return this.http.get<PipelineResult>(webApiQueryRun, {
      params: { appId: this.context.appId.toString(), id: id.toString(), top: top.toString() }
    });
  }

  /** `top` - fetch first X items */
  debugStream(id: number, source: string, sourceOut: string, top: number) {
    return this.http.get<PipelineResult>(webApiQueryDebugStream, {
      params: { appId: this.context.appId.toString(), id: id.toString(), from: source, out: sourceOut, top: top.toString() }
    });
  }
}
