import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { webApiQueryDataSources, webApiQueryGet, webApiQueryRun, webApiQuerySave } from '../../app-administration/services';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DataSource, PipelineDataSource, PipelineModel, PipelineResult } from '../models';

@Injectable()
export class QueryDefinitionService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  fetchPipeline(pipelineEntityId: number) {
    const pipelineModel$ = this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiQueryGet), {
      params: { appId: this.context.appId.toString(), id: pipelineEntityId.toString() }
    }) as Observable<PipelineModel>;

    return pipelineModel$.pipe(
      map(pipelineModel => {
        // if pipeline is new, populate it with default model
        if (!pipelineModel.DataSources.length) {
          this.buildDefaultModel(pipelineModel);
        }
        this.fixPipelineDataSources(pipelineModel.DataSources);
        return pipelineModel;
      }),
    );
  }

  private buildDefaultModel(pipelineModel: PipelineModel) {
    const templateDataSources = eavConstants.pipelineDesigner.defaultPipeline.dataSources;
    for (const templateDS of templateDataSources) {
      if (templateDS.visualDesignerData == null) {
        templateDS.visualDesignerData = { Top: 100, Left: 100 };
      }
      const pipelineDataSource: PipelineDataSource = {
        Description: '',
        EntityGuid: templateDS.entityGuid || 'unsaved' + (pipelineModel.DataSources.length + 1),
        EntityId: undefined,
        Name: this.typeNameFilter(templateDS.partAssemblyAndType, 'className'),
        PartAssemblyAndType: templateDS.partAssemblyAndType,
        VisualDesignerData: templateDS.visualDesignerData,
      };
      pipelineModel.DataSources.push(pipelineDataSource);
    }

    pipelineModel.Pipeline.StreamWiring = eavConstants.pipelineDesigner.defaultPipeline.streamWiring;
  }

  private fixPipelineDataSources(pipelineDataSources: PipelineDataSource[]) {
    const outDataSourceExists = pipelineDataSources.some(pipelineDS => pipelineDS.EntityGuid === 'Out');
    if (!outDataSourceExists) {
      const outDs = eavConstants.pipelineDesigner.outDataSource;
      const outDsConst: PipelineDataSource = {
        Description: outDs.description,
        EntityGuid: 'Out',
        EntityId: undefined,
        Name: outDs.name,
        PartAssemblyAndType: outDs.className,
        VisualDesignerData: outDs.visualDesignerData,
      };
      pipelineDataSources.push(outDsConst);
    }

    for (const pipelineDataSource of pipelineDataSources) {
      pipelineDataSource.VisualDesignerData = pipelineDataSource.VisualDesignerData || { Top: 50, Left: 50 };
    }
  }

  fetchDataSources() {
    const dataSources$ = this.http.get(
      this.dnnContext.$2sxc.http.apiUrl(webApiQueryDataSources)
    ) as Observable<DataSource[]>;
    return dataSources$.pipe(
      map(dataSources => {
        const outDs = eavConstants.pipelineDesigner.outDataSource;
        const outDsConst: DataSource = {
          ContentType: undefined,
          Difficulty: 100,
          DynamicOut: false,
          EnableConfig: undefined,
          HelpLink: undefined,
          Icon: undefined,
          In: outDs.in,
          Name: outDs.name || outDs.className,
          Out: undefined,
          PartAssemblyAndType: outDs.className,
          PrimaryType: 'Target',
          UiHint: undefined,
          allowNew: false,
        };
        dataSources.push(outDsConst);
        return dataSources;
      }),
    );
  }

  typeNameFilter(input: string, format: string) {
    const globalParts = input.split(', ');

    switch (format) {
      case 'classFullName':
        const classFullName = globalParts[0];
        return classFullName;
      case 'className':
        const classFullNameParts = globalParts[0].split('.');
        const className = classFullNameParts[classFullNameParts.length - 1];
        return className;
    }

    return input;
  }

  /** Save the current query and reload entire definition as returned from server */
  savePipeline(pipelineModel: PipelineModel) {
    const pipeline = pipelineModel.Pipeline;
    const dataSources = pipelineModel.DataSources;
    const pipelineModel$ = this.http.post(
      this.dnnContext.$2sxc.http.apiUrl(webApiQuerySave),
      { pipeline, dataSources },
      { params: { appId: this.context.appId.toString(), Id: pipeline.EntityId.toString() } }
    ) as Observable<PipelineModel>;

    return pipelineModel$.pipe(
      map(pipeModel => {
        this.fixPipelineDataSources(pipeModel.DataSources);
        return pipeModel;
      }),
    );
  }

  runPipeline(id: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiQueryRun), {
      params: { appId: this.context.appId.toString(), id: id.toString() }
    }) as Observable<PipelineResult>;
  }

}
