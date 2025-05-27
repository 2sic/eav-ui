import { classLogEnabled } from '../../shared/logging';
import { DataSourceSet } from './data-source-set.model';
import { JsPlumbInstanceOld } from './jsplumb.models';
import { domIdOfGuid } from './plumber-constants';
import { Plumber } from './plumber.helper';
import { QueryDataManager } from './query-data-manager';

const logSpecs = {
  all: false,
  initWirings: true,
  ensureWireEndpointExists: true,
  findDataSourceInDom: true,
  fields: ['TestIn2', '*'],
}

export class WiringsHelper {
  log = classLogEnabled({WiringsHelper}, logSpecs);

  constructor(
    private plumber: Plumber,
    private instance: JsPlumbInstanceOld,
    private queryData: QueryDataManager,
  ) { }

  initWirings() {
    const l = this.log.fnIf('initWirings');
    const wiringsRaw = this.queryData.query.Pipeline.StreamWiring;
    if (!wiringsRaw)
      return l.end('no wirings');

    const wirings = wiringsRaw.map(wire => {
      // read connections from Pipeline
      const outDsDomId = domIdOfGuid(wire.From);
      const outPointDomId = outDsDomId + '_out_' + wire.Out;
      const inDsDomId = domIdOfGuid(wire.To);
      const inPointDomId = inDsDomId + '_in_' + wire.In;
      return {
        outPointDomId,
        inPointDomId,
        wire
      };
    });

    l.a('wirings', { wireDetails: wirings });

    // Build all the Endpoints which don't exist yet based on the wirings
    wirings.forEach(w => {
      // Ensure Out-Endpoint exist
      this.#ensureWireEndpointExists(w.outPointDomId, w.wire.From, w.wire.Out, false);

      // Ensure In-Endpoint exist
      this.#ensureWireEndpointExists(w.inPointDomId, w.wire.To, w.wire.In, true);
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
  

  #ensureWireEndpointExists(endpointId: string, sourceGuid: string, name: string, isIn: boolean) : DataSourceSet | null {
    const l = this.log.fnIfInList('ensureWireEndpointExists', 'fields', name, { endpointId, sourceGuid, name, isIn });
    // Find data source infos & DOM, if not found, do nothing
    const set = this.#findDataSourceInDom(endpointId, sourceGuid, name);
    if (set == null)
      return l.r(set, "set null");

    // const name = isIn ? wire.In : wire.Out;
    this.plumber.endpoints.addEndpoint(set.domDataSource, name, isIn, set.dataSource);
    return l.r(set, 'ok');
  }

  #findDataSourceInDom(endpointId: string, sourceGuid: string, name: string) : DataSourceSet | null {
    const l = this.log.fnIfInList('findDataSourceInDom', 'fields', name, { endpointId, sourceGuid, name });
    // if exists, do nothing
    if (this.instance.getEndpoint(endpointId))
      return l.r(null, "endpoint exists, exit");

    const result = this.queryData.findDataSourceAndDom(sourceGuid);
    return l.r(result, `found: ${result != null}`);
  }

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
