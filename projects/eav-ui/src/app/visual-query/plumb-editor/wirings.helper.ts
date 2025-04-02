import { classLogEnabled } from '../../shared/logging';
import { DataSource, PipelineDataSource, PipelineModel } from '../models';
import { findDefByType } from './datasource.helpers';
import { PlumbUntypedAny } from './plumb-editor.models';
import { dataSrcIdPrefix, Plumber } from './plumber.helper';

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
    private instance: PlumbUntypedAny, 
    private jsPlumbRoot: HTMLElement, 
    private pipelineModel: PipelineModel,
    private dataSources: DataSource[]) {
  }

  initWirings() {
    const l = this.log.fnIf('initWirings');
    const wirings = this.pipelineModel.Pipeline.StreamWiring;
    if (!wirings)
      return l.end('no wirings');

    const inGroups = groupBy(wirings, wire => wire.To);
    const outGroups = groupBy(wirings, wire => wire.From);

    l.values({ inGroups, outGroups });

    wirings.forEach(wire => {
      // read connections from Pipeline
      const sourceElementId = dataSrcIdPrefix + wire.From;
      const outDomId = sourceElementId + '_out_' + wire.Out;
      const targetElementId = dataSrcIdPrefix + wire.To;
      const inDomId = targetElementId + '_in_' + wire.In;

      // 2025-04-02 2dm standardized / reduced the code

      // Ensure Out-Endpoint exist
      const outWireLength = outGroups[wire.From].length;
      this.#ensureWireEndpointExists(outDomId, sourceElementId, wire.Out, false, outWireLength);

      // Ensure In-Endpoint exist
      const inWireLength = inGroups[wire.To].length;
      const set = this.#ensureWireEndpointExists(inDomId, targetElementId, wire.In, true, inWireLength);

      // Try to add additional connections
      // Note that the set is null for all "Default" connections, since they already exist
      if (set != null) {
        // l.a('2dm set not null ' + set.dataSource.Name, {set});
        var def = findDefByType(this.dataSources, set.dataSource.PartAssemblyAndType);
        if (def.OutMode == 'mirror-in') {
          l.a(`Will mirror in for ${inDomId}`, {set, def});
          const outDomIdOfIn = targetElementId + '_out_' + wire.In;
          this.#ensureWireEndpointExists(outDomIdOfIn, targetElementId, wire.In, false, inWireLength);
        }
      } 
      // else console.log('2dm set null');

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

      try {
        this.instance.connect({
          uuids: [outDomId, inDomId],
          paintStyle: this.plumber.nextLinePaintStyle(outDomId),
        });
      } catch (e) {
        console.error({ message: 'Connection failed', from: outDomId, to: inDomId });
      }
    });
    l.end();
  }
  

  #ensureWireEndpointExists(endpointId: string, sourceElementId: string, name: string, isIn: boolean, count: number) : DataSourceSet | null {
    const l = this.log.fnIfInList('ensureWireEndpointExists', 'fields', name, { endpointId, sourceElementId, name, isIn, count });
    // Find data source infos & DOM, if not found, do nothing
    const set = this.#findDataSourceInDom(endpointId, sourceElementId, name);
    if (set == null)
      return l.r(set, "set null");

    // const name = isIn ? wire.In : wire.Out;
    this.plumber.addEndpoint(set.domDataSource, name, isIn, set.dataSource, count);
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

    const guid = domDataSource.id.replace(dataSrcIdPrefix, '');
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
