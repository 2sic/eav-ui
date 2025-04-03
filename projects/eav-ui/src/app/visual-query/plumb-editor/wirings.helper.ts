import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineDataSource, PipelineModel } from '../models';
import { findDefByType } from './datasource.helpers';
import { JsPlumbInstance } from './jsplumb.models';
import { domIdOfGuid, guidOfDomId } from './plumber-constants';
import { Plumber } from './plumber.helper';

const logSpecs = {
  all: false,
  initWirings: true,
  ensureWireEndpointExists: true,
  findDataSourceInDom: true,
  fields: ['TestIn2'],
}

export class WiringsHelper {
  log = classLogEnabled({WiringsHelper}, logSpecs);

  constructor(
    private plumber: Plumber,
    private instance: JsPlumbInstance, 
    private jsPlumbRoot: HTMLElement, 
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[]) {
  }

  initWirings() {
    const l = this.log.fnIf('initWirings');
    const wiringsRaw = this.pipelineModel.Pipeline.StreamWiring;
    if (!wiringsRaw)
      return l.end('no wirings');

    const inGroups = groupBy(wiringsRaw, wire => wire.To);
    const outGroups = groupBy(wiringsRaw, wire => wire.From);

    l.values({ inGroups, outGroups });

    const wirings = wiringsRaw.map(wire => {
      // read connections from Pipeline
      const outDsDomId = domIdOfGuid(wire.From);
      const outPointDomId = outDsDomId + '_out_' + wire.Out;
      const inDsDomId = domIdOfGuid(wire.To);
      const inPointDomId = inDsDomId + '_in_' + wire.In;
      return {
        outDsDomId,
        outPointDomId,
        outWireCount: outGroups[wire.From].length,
        inDsDomId,
        inPointDomId,
        inWireCount: inGroups[wire.To].length,
        wire
      };
    });

    l.a('wirings', { wireDetails: wirings });

    // Build all the Endpoints which don't exist yet based on the wirings
    wirings.forEach(w => {
      // 2025-04-02 2dm standardized / reduced the code

      // Ensure Out-Endpoint exist
      this.#ensureWireEndpointExists(w.outPointDomId, w.outDsDomId, w.wire.Out, false, w.outWireCount);

      // Ensure In-Endpoint exist
      const set = this.#ensureWireEndpointExists(w.inPointDomId, w.inDsDomId, w.wire.In, true, w.inWireCount);

      // Try to add additional connections
      // Note that the set is null for all "Default" connections, since they already exist
      if (set != null) {
        // l.a('2dm set not null ' + set.dataSource.Name, {set});
        var def = findDefByType(this.dataSources, set.dataSource.PartAssemblyAndType);
        if (def.OutMode == 'mirror-in') {
          l.a(`Will mirror in for ${w.inPointDomId}`, {set, def});
          const outDomIdOfIn = w.inDsDomId + '_out_' + w.wire.In;
          this.#ensureWireEndpointExists(outDomIdOfIn, w.inDsDomId, w.wire.In, false, w.inWireCount);
        }
      }
    });

    // Connect all the wirings
    wirings.forEach(w => this.#connect(w.outPointDomId, w.inPointDomId));

    this.instance.repaintEverything();

    l.end();
  }

  #connect(outDomId: string, inDomId: string) {
    try {
      this.instance.connect({
        uuids: [outDomId, inDomId],
        paintStyle: this.plumber.lineColors.nextLinePaintStyle(outDomId),
      });
    } catch (e) {
      console.error({ message: 'Connection failed', from: outDomId, to: inDomId });
    }
  }
  

  #ensureWireEndpointExists(endpointId: string, sourceElementId: string, name: string, isIn: boolean, count: number) : DataSourceSet | null {
    const l = this.log.fnIfInList('ensureWireEndpointExists', 'fields', name, { endpointId, sourceElementId, name, isIn, count });
    // Find data source infos & DOM, if not found, do nothing
    const set = this.#findDataSourceInDom(endpointId, sourceElementId, name);
    if (set == null)
      return l.r(set, "set null");

    // const name = isIn ? wire.In : wire.Out;
    this.plumber.endpoints.addEndpoint(set.domDataSource, name, isIn, set.dataSource, count);
    return l.r(set, 'ok');
  }

  #findDataSourceInDom(endpointId: string, sourceElementId: string, name: string) : DataSourceSet | null {
    const l = this.log.fnIfInList('findDataSourceInDom', 'fields', name, { endpointId, sourceElementId, name });
    // if exists, do nothing
    if (this.instance.getEndpoint(endpointId))
      return l.r(null, "endpoint exists, exit");

    // if DOM doesn't exist, do nothing
    const domDataSource = this.jsPlumbRoot.querySelector<HTMLElement>('#' + sourceElementId);
    if (!domDataSource)
      return l.r(null, "DOM not found, exit");

    const guid = guidOfDomId(domDataSource.id);
    const dataSource = this.pipelineModel.DataSources.find(pipeDs => pipeDs.EntityGuid === guid);
    return l.r({ domDataSource, dataSource }, "returning data source");
  }
}

interface DataSourceSet {
  domDataSource: HTMLElement;
  dataSource: PipelineDataSource;
}


// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);


      // 2025-04-02 2dm standardized / reduced the code old
      // leave commented out portions in for a few weeks, to ensure we know what happened if something breaks
      // Ensure In-Endpoint exist
      // if (!this.#instance.getEndpoint(fromUuid)) {
      //   const domDataSource = this.jsPlumbRoot.querySelector<HTMLElement>('#' + sourceElementId);
      //   if (!domDataSource)
      //     return;
      //   const guid: string = domDataSource.id.replace(dataSrcIdPrefix, '');
      //   const dataSource = this.pipelineModel.DataSources.find(pipeDataSource => pipeDataSource.EntityGuid === guid);
      //   this.#addEndpoint(domDataSource, wire.Out, false, dataSource, outGroups[wire.From].length);
      // }
      // Ensure Out-Endpoint exist
      // if (!this.#instance.getEndpoint(toUuid)) {
      //   const domDataSource = this.jsPlumbRoot.querySelector<HTMLElement>('#' + targetElementId);
      //   if (!domDataSource)
      //     return;
      //   const guid: string = domDataSource.id.replace(dataSrcIdPrefix, '');
      //   const dataSource = this.pipelineModel.DataSources.find(pipeDataSource => pipeDataSource.EntityGuid === guid);
      //   // if (wire.In === "DEBUG") debugger;
      //   this.#addEndpoint(domDataSource, wire.In, true, dataSource, inGroups[wire.To].length);
      // }

      // this.#connect(w.outPointDomId, w.inPointDomId);
