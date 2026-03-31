import { classLog } from '../../../../../../shared/logging';
import { DataSourceSet } from '../../models/data-source-definition';
import { JsPlumbInstance } from '../jsplumb.models';
import { domIdOfGuid } from '../plumber-constants';
import { Plumber } from '../plumber.helper';
import { QueryDataManager } from '../query-data-manager';

const logSpecs = {
  all: false,
  initWirings: true,
  ensureWireEndpointExists: false,
  findDataSourceInDom: false,
  connect: false,
  fields: ['TestIn2', '*'],
}

export class WiringsHelper {
  log = classLog({ WiringsHelper }, logSpecs);

  constructor(
    private plumber: Plumber,
    private instance: JsPlumbInstance,
    private queryData: QueryDataManager,
  ) { }

  #safeWireEndpointName(endpointId: string): string {
    if (endpointId == '*')
      return 'asterisk';
    return endpointId;
  }

  initWirings() {
    const l = this.log.fnIf('initWirings');
    const wiringsRaw = this.queryData.query.Pipeline.StreamWiring;
    if (!wiringsRaw)
      return l.end('no wirings');

    const wirings = wiringsRaw.map(wire => {
      // read connections from Pipeline
      const outDsDomId = domIdOfGuid(wire.From);
      const outTargetName = this.#safeWireEndpointName(wire.Out);
      const outPointDomId = outDsDomId + '_out_' + outTargetName;
      const inDsDomId = domIdOfGuid(wire.To);
      const inTargetName = this.#safeWireEndpointName(wire.In);
      const inPointDomId = inDsDomId + '_in_' + inTargetName;
      return {
        outPointDomId,
        inPointDomId,
        outTargetName,
        inTargetName,
        wire
      };
    });

    l.a('wirings', { wireDetails: wirings });

    // Build all the Endpoints which don't exist yet based on the wirings
    wirings.forEach(w => {
      // Ensure Out-Endpoint exist
      this.#ensureWireEndpointExists(w.outPointDomId, w.wire.From, w.outTargetName, w.wire.Out, false);

      // Ensure In-Endpoint exist
      this.#ensureWireEndpointExists(w.inPointDomId, w.wire.To, w.inTargetName, w.wire.In, true);
    });

    // Connect all the wirings
    wirings.forEach(w => this.#connect(w.outPointDomId, w.inPointDomId));

    this.instance.repaintEverything();

    l.end();
  }

  #connect(outDomId: string, inDomId: string) {
    const l = this.log.fnIf('connect', { outDomId, inDomId });
    try {
      this.instance.connect({
        uuids: [outDomId, inDomId],
        paintStyle: this.plumber.lineColors.nextLinePaintStyle(outDomId),
      });
    } catch (e) {
      console.error({ message: 'Connection failed', from: outDomId, to: inDomId });
    }
    l.end();
  }
  

  #ensureWireEndpointExists(endpointId: string, sourceGuid: string, name: string, label: string, isIn: boolean) : DataSourceSet | null {
    const l = this.log.fnIfInFields('ensureWireEndpointExists', name, { endpointId, sourceGuid, name, label, isIn });
    // Find data source infos & DOM, if not found, do nothing
    const set = this.#findDataSourceInDom(endpointId, sourceGuid, name);
    if (set == null)
      return l.r(set, "set null");

    // const name = isIn ? wire.In : wire.Out;
    this.plumber.endpoints.addEndpoint(set, name, label, isIn);
    return l.r(set, 'ok');
  }

  #findDataSourceInDom(endpointId: string, sourceGuid: string, name: string) : DataSourceSet | null {
    const l = this.log.fnIfInFields('findDataSourceInDom', name, { endpointId, sourceGuid, name });
    // if exists, do nothing
    if (this.instance.getEndpoint(endpointId))
      return l.r(null, "endpoint exists, exit");

    const result = this.queryData.findDataSourceAndDom(sourceGuid);
    return l.r(result, `found: ${result != null}`);
  }

}
