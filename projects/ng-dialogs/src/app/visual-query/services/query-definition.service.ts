import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { eavConstants } from '../../shared/constants/eav-constants';

@Injectable()
export class QueryDefinitionService {
  constructor(
    private http: HttpClient,
    private context: Context,
    private dnnContext: DnnContext,
  ) { }

  async loadQuery(pipelineEntityId: number): Promise<any> {
    const model: any = await this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/GetPipeline'), {
      params: { appId: this.context.appId.toString(), id: pipelineEntityId.toString() }
    }).toPromise();

    model.InstalledDataSources = await this.http.get(
      this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/GetInstalledDataSources')
    ).toPromise();

    // Init new Pipeline Object
    if (!pipelineEntityId) {
      model.Pipeline = {
        AllowEdit: 'True',
      };
    }

    const outDs = eavConstants.pipelineDesigner.outDataSource;
    // Add Out-DataSource for the UI
    model.InstalledDataSources.push({
      PartAssemblyAndType: outDs.className,
      Name: outDs.name || outDs.className,
      In: outDs.in,
      Out: null,
      allowNew: false,
      PrimaryType: 'Target',
      DynamicOut: false,
      Difficulty: 100,
    });

    this.postProcessDataSources(model);

    const queryDef = {
      id: pipelineEntityId,
      data: model,
      readOnly: false,
    };

    // If a new (empty) Pipeline is made, init new Pipeline
    if (!queryDef.id || queryDef.data.DataSources.length === 1) {
      queryDef.readOnly = false;
      this.loadQueryFromDefaultTemplate(queryDef);
    } else {
      // if read only, show message
      queryDef.readOnly = !model.Pipeline.AllowEdit;
    }

    return queryDef;
  }

  // Extend Pipeline-Model retrieved from the Server
  private postProcessDataSources(model: any) {
    const outDs = eavConstants.pipelineDesigner.outDataSource;
    // Append Out-DataSource for the UI
    model.DataSources.push({
      Name: outDs.name,
      Description: outDs.description,
      EntityGuid: 'Out',
      PartAssemblyAndType: outDs.className,
      VisualDesignerData: outDs.visualDesignerData,
      ReadOnly: true,
      Difficulty: 100
    });

    // Extend each DataSource with Definition-Property and ReadOnly Status
    for (const dataSource of model.DataSources) {
      dataSource.Definition = () => this.getDataSourceDefinitionProperty(model, dataSource);
      dataSource.ReadOnly = dataSource.ReadOnly || !model.Pipeline.AllowEdit;
      // in case server returns null, use a default setting
      dataSource.VisualDesignerData = dataSource.VisualDesignerData || { Top: 50, Left: 50 };
    }
  }

  // Get the Definition of a DataSource
  private getDataSourceDefinitionProperty(model: any, dataSource: any) {
    const definition = model.InstalledDataSources.filter((d: any) => d.PartAssemblyAndType === dataSource.PartAssemblyAndType)[0];
    if (!definition) {
      throw new Error(`DataSource Definition not found: ${dataSource.PartAssemblyAndType}`);
    }
    return definition;
  }

  // Init a new Pipeline with DataSources and Wirings from Configuration
  private loadQueryFromDefaultTemplate(queryDef: any) {
    const templateForNew = eavConstants.pipelineDesigner.defaultPipeline.dataSources;
    for (const dataSource of templateForNew) {
      this.addDataSource(queryDef, dataSource.partAssemblyAndType, dataSource.visualDesignerData, dataSource.entityGuid, null);
    }

    // attach template wiring
    queryDef.data.Pipeline.StreamWiring = eavConstants.pipelineDesigner.defaultPipeline.streamWiring;
  }

  private addDataSource(queryDef: any, partAssemblyAndType: any, visualDesignerData: any, entityGuid: any, name: any) {
    if (!visualDesignerData) {
      visualDesignerData = { Top: 100, Left: 100 };
    }

    let newDataSource = {
      VisualDesignerData: visualDesignerData,
      Name: name || this.typeNameFilter(partAssemblyAndType, 'className'),
      Description: '',
      PartAssemblyAndType: partAssemblyAndType,
      EntityGuid: entityGuid || 'unsaved' + (queryDef.dsCount + 1)
    };
    // Extend it with a Property to it's Definition
    newDataSource = Object.assign(newDataSource, this.getNewDataSource(queryDef.data, newDataSource));

    queryDef.data.DataSources.push(newDataSource);
  }

  typeNameFilter(input: any, format: any) {
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

  // Get a JSON for a DataSource with Definition-Property
  private getNewDataSource(model: any, dataSourceBase: any) {
    return {
      Definition: () => this.getDataSourceDefinitionProperty(model, dataSourceBase)
    };
  }

  dsTypeInfo(dataSource: any, queryDef: any) {
    // maybe we already retrieved it before...
    const cacheKey = dataSource.EntityGuid;
    if (!queryDef._typeInfos) { queryDef._typeInfos = {}; }
    if (queryDef._typeInfos[cacheKey]) { return queryDef._typeInfos[cacheKey]; }

    let typeInfo = null;
    // try to find the type on the source
    const found = queryDef.data.InstalledDataSources.find((ids: any) => ids.PartAssemblyAndType === dataSource.PartAssemblyAndType);
    const guiTypes = this.buildGuiTypes();
    if (found) {
      const def = found;
      const primType = def.PrimaryType;
      typeInfo = Object.assign({}, primType ? guiTypes[primType] : guiTypes.Unknown);
      if (def.Icon) { typeInfo.icon = guiTypes.iconPrefix + def.Icon; }
      if (def.DynamicOut) { typeInfo.dynamicOut = true; }
      if (def.HelpLink) { typeInfo.helpLink = def.HelpLink; }
      if (def.EnableConfig) { typeInfo.config = def.EnableConfig; }
    }
    if (!typeInfo) { typeInfo = guiTypes.Unknown; }

    queryDef._typeInfos[cacheKey] = typeInfo;
    return typeInfo;
  }

  private buildGuiTypes() {
    const guiTypes: { [key: string]: any } = {
      iconPrefix: ''
    };

    function addGuiType(name: any, icon: any, notes: any) {
      guiTypes[name] = {
        name,
        icon: guiTypes.iconPrefix + icon,
        notes
      };
    }

    addGuiType('Unknown', 'fiber_manual_record', 'unknown type');
    addGuiType('Cache', 'history', 'caching of data');
    addGuiType('Filter', 'filter_list', 'filter data - usually returning less items than came in');
    addGuiType('Logic', 'share', 'logic operations - usually choosing between different streams');
    addGuiType('Lookup', 'search', 'lookup operation - usually looking for other data based on a criteria');
    addGuiType('Modify', 'star_half', 'modify data - usually changing, adding or removing values'); // todo
    addGuiType('Security', 'account_circle', 'security - usually limit what the user sees based on his identity');
    addGuiType('Sort', 'sort', 'sort the items');
    addGuiType('Source', 'cloud_upload', 'source of new data - usually SQL, CSV or similar');
    addGuiType('Target', 'adjust', 'target - usually just a destination of data');

    return guiTypes;
  }

}
