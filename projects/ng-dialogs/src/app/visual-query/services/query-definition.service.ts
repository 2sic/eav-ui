import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import cloneDeep from 'lodash-es/cloneDeep';

import { Context } from '../../shared/services/context';
import { eavConstants } from '../../shared/constants/eav.constants';
import { PipelineModel, PipelineDataSource, VisualDesignerData } from '../models/pipeline.model';
import { DataSource } from '../models/data-sources.model';
import { QueryDef, QueryDefData, TypeInfo } from '../models/query-def.model';
import { PipelineResult } from '../models/pipeline-result.model';
import { GuiTypes } from '../models/gui-type.model';

const guiTypes: GuiTypes = {
  Cache: { name: 'Cache', icon: 'history', notes: 'Caching of data' },
  Filter: { name: 'Filter', icon: 'filter_list', notes: 'Filter data - usually returning less items than came in' },
  Logic: { name: 'Logic', icon: 'share', notes: 'Logic operations - usually choosing between different streams' },
  Lookup: { name: 'Lookup', icon: 'search', notes: 'Lookup operation - usually looking for other data based on a criteria' },
  Modify: { name: 'Modify', icon: 'star_half', notes: 'Modify data - usually changing, adding or removing values' },
  Security: { name: 'Security', icon: 'account_circle', notes: 'Security - usually limit what the user sees based on his identity' },
  Sort: { name: 'Sort', icon: 'sort', notes: 'Sort the items' },
  Source: { name: 'Source', icon: 'cloud_upload', notes: 'Source of new data - usually SQL, CSV or similar' },
  Target: { name: 'Target', icon: 'adjust', notes: 'Target - usually just a destination of data' },
  Unknown: { name: 'Unknown', icon: 'fiber_manual_record', notes: 'Unknown type' },
};

@Injectable()
export class QueryDefinitionService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  loadQuery(pipelineEntityId: number) {
    const pipelineModel$ = this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/GetPipeline'), {
      params: { appId: this.context.appId.toString(), id: pipelineEntityId.toString() }
    }) as Observable<PipelineModel>;

    const installedDataSources$ = this.http.get(
      this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/GetInstalledDataSources')
    ) as Observable<DataSource[]>;

    return forkJoin([pipelineModel$, installedDataSources$]).pipe(
      map(combined => {
        const pipelineModel = combined[0];
        const installedDataSources = combined[1];

        const queryDefData: QueryDefData = {
          DataSources: pipelineModel.DataSources,
          InstalledDataSources: installedDataSources,
          Pipeline: pipelineModel.Pipeline,
        };

        // Init new Pipeline Object
        if (!pipelineEntityId) {
          queryDefData.Pipeline = {
            AllowEdit: true,
            Description: undefined,
            EntityGuid: undefined,
            EntityId: undefined,
            Name: undefined,
            ParametersGroup: undefined,
            Params: undefined,
            StreamWiring: undefined,
            StreamsOut: undefined,
            TestParameters: undefined,
          };
        }

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
        installedDataSources.push(outDsConst);

        this.postProcessDataSources(queryDefData);

        const queryDef: QueryDef = {
          id: pipelineEntityId,
          data: queryDefData,
          readOnly: false,
        };

        // If a new (empty) Pipeline is made, init new Pipeline
        if (!queryDef.id || queryDef.data.DataSources.length === 1) {
          queryDef.readOnly = false;
          this.loadQueryFromDefaultTemplate(queryDef);
        } else {
          // if read only, show message
          queryDef.readOnly = !queryDef.data.Pipeline.AllowEdit;
        }

        return queryDef;
      })
    ) as Observable<QueryDef>;
  }

  // Extend Pipeline-Model retrieved from the Server
  postProcessDataSources(queryDefData: QueryDefData) {
    // stop Post-Process if the model already contains the Out-DataSource
    if (queryDefData.DataSources.find(dataSource => dataSource.EntityGuid === 'Out')) { return; }

    const outDs = eavConstants.pipelineDesigner.outDataSource;
    const outDsConst: PipelineDataSource = {
      Description: outDs.description,
      EntityGuid: 'Out',
      EntityId: undefined,
      Name: outDs.name,
      PartAssemblyAndType: outDs.className,
      VisualDesignerData: outDs.visualDesignerData,
      ReadOnly: true,
      Difficulty: 100,
    };
    // Append Out-DataSource for the UI
    queryDefData.DataSources.push(outDsConst);

    // Extend each DataSource with Definition-Property and ReadOnly Status
    for (const dataSource of queryDefData.DataSources) {
      dataSource.Definition = () => this.getDataSourceDefinitionProperty(queryDefData, dataSource);
      dataSource.ReadOnly = dataSource.ReadOnly || !queryDefData.Pipeline.AllowEdit;
      // in case server returns null, use a default setting
      dataSource.VisualDesignerData = dataSource.VisualDesignerData || { Top: 50, Left: 50 };
    }
  }

  // Get the Definition of a DataSource
  private getDataSourceDefinitionProperty(queryDefData: QueryDefData, dataSource: PipelineDataSource) {
    const definition = queryDefData.InstalledDataSources
      .find(installedDataSource => installedDataSource.PartAssemblyAndType === installedDataSource.PartAssemblyAndType);
    if (definition == null) {
      throw new Error(`DataSource Definition not found: ${dataSource.PartAssemblyAndType}`);
    }
    return definition;
  }

  // Init a new Pipeline with DataSources and Wirings from Configuration
  private loadQueryFromDefaultTemplate(queryDef: QueryDef) {
    const templateForNew = eavConstants.pipelineDesigner.defaultPipeline.dataSources;
    for (const dataSource of templateForNew) {
      this.addDataSource(queryDef, dataSource.partAssemblyAndType, dataSource.visualDesignerData, dataSource.entityGuid, null);
    }

    // attach template wiring
    queryDef.data.Pipeline.StreamWiring = eavConstants.pipelineDesigner.defaultPipeline.streamWiring;
  }

  addDataSource(queryDef: QueryDef, partAssemblyAndType: string, visualDesignerData: VisualDesignerData, entityGuid: string, name: string) {
    if (visualDesignerData == null) {
      visualDesignerData = { Top: 100, Left: 100 };
    }

    const newDataSource: PipelineDataSource = {
      Description: '',
      EntityGuid: entityGuid || 'unsaved' + (queryDef.dsCount + 1),
      EntityId: undefined,
      Name: name || this.typeNameFilter(partAssemblyAndType, 'className'),
      PartAssemblyAndType: partAssemblyAndType,
      VisualDesignerData: visualDesignerData,
    };
    newDataSource.Definition = () => this.getDataSourceDefinitionProperty(queryDef.data, newDataSource);

    queryDef.data.DataSources.push(newDataSource);
  }

  typeNameFilter(input: string, format: string) {
    const globalParts = input.match(/[^,\s]+/g);

    switch (format) {
      case 'classFullName':
        if (globalParts) {
          return globalParts[0];
        }
        break;
      case 'className':
        if (globalParts) {
          const classFullName = globalParts[0].match(/[^\.]+/g);
          return classFullName[classFullName.length - 1];
        }
    }

    return input;
  }

  dsTypeInfo(dataSource: PipelineDataSource, queryDef: QueryDef) {
    // maybe we already retrieved it before...
    const cacheKey = dataSource.EntityGuid;
    if (!queryDef._typeInfos) { queryDef._typeInfos = {}; }
    if (queryDef._typeInfos[cacheKey]) { return queryDef._typeInfos[cacheKey]; }

    let typeInfo: TypeInfo;
    // try to find the type on the source
    const def = queryDef.data.InstalledDataSources.find(ids => ids.PartAssemblyAndType === dataSource.PartAssemblyAndType);
    if (def) {
      typeInfo = { ...(def.PrimaryType ? guiTypes[def.PrimaryType] : guiTypes.Unknown) };
      if (def.Icon) { typeInfo.icon = def.Icon; }
      if (def.DynamicOut) { typeInfo.dynamicOut = true; }
      if (def.HelpLink) { typeInfo.helpLink = def.HelpLink; }
      if (def.EnableConfig) { typeInfo.config = def.EnableConfig; }
    }
    if (!typeInfo) { typeInfo = guiTypes.Unknown; }

    queryDef._typeInfos[cacheKey] = typeInfo;
    return typeInfo;
  }

  // save the current query and reload entire definition as returned from server
  save(queryDef: QueryDef) {
    const pipeline = queryDef.data.Pipeline;

    // Remove some Properties from the DataSource before Saving
    const dataSourcesPrepared = queryDef.data.DataSources.map(dataSource => {
      const dataSourceClone = cloneDeep(dataSource);
      delete dataSourceClone.ReadOnly;
      return dataSourceClone;
    });

    return this.http.post(
      this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/SavePipeline'),
      { pipeline, dataSources: dataSourcesPrepared },
      { params: { appId: this.context.appId.toString(), Id: pipeline.EntityId.toString() } }
    ) as Observable<PipelineModel>;
  }

  queryPipeline(id: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/QueryPipeline'), {
      params: { appId: this.context.appId.toString(), id: id.toString() }
    }) as Observable<PipelineResult>;
  }

}
