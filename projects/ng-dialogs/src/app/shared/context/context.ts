import { Injectable, SkipSelf, Optional } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

const keyAppId = 'appId';
const keyZoneId = 'zoneId';
const keyRequestToken = 'rvt';

/**
 * The context provides information
 *
 * @export
 * @class Context
 */
@Injectable()
export class Context {

  /** Determines if the context is ready to use, and everything is initialized */
  public ready = false;

  /** The current Zone ID */
  public zoneId: number;

  /** The current App ID */
  public appId: number;

  /**
   * The request verification token for http requests
   * It's only loaded from the root, never from sub-contexts
  */
  public requestToken: string;

  // TODO: spm other "global" properties like

  constructor(@Optional() @SkipSelf() public context: Context) {
    console.log('Context.contstructor');
    if (context) { this.initFromParentContext(context); }

    // const paramMap = route.snapshot.paramMap;
    // const x = router.routerState.snapshot.url;
    // console.log('url', x);
    // const root = router.routerState.snapshot.root;

    // console.log('EavParams.constructor()', route, paramMap);
    // console.log('EavParams', route.snapshot.url, {root});
    // const z = paramMap.get('zoneId');
    // this.zoneId = parseInt(z, 10);
    // const a = paramMap.get('appId');
    // this.appId = parseInt(a, 10);
  }


  /**
   * This is the initializer at entry-componets of modules
   * It ensures that within that component, the context has the values given by the route
   *
   * @param {ActivatedRoute} route
   * @memberof Context
   */
  init(route: ActivatedRoute) {
    console.log('Context.init', route);
    const state = route.snapshot;

    // TODO: always use consts for the keys like 'appId'

    // Note: the zone is always from global, so don't retrieve from route
    // this.zoneId = this.routeNumber(state, keyZoneId, true) || this.appId;

    this.appId = this.routeNumber(state, keyAppId, true) || this.appId;

    // TODO: SPM more stuff from the route

    this.ready = true;
  }

  /**
   * Initialize this context from an existing parent.
   * This is used by child-contexts, which inherit values from the parent.
   * @private
   * @param {Context} parent
   * @memberof Context
   */
  private initFromParentContext(parent: Context) {
    this.requestToken = parent.requestToken;
    this.zoneId = parent.zoneId;
    this.appId = parent.appId;

    // TODO: spm add other, globally shared params
  }

  initRoot() {
    console.log('Context.initRoot');

    this.requestToken = sessionStorage.getItem(keyRequestToken);
    this.zoneId = this.sessionNumber(keyZoneId);
    this.appId = this.sessionNumber(keyAppId);

    // TODO: SPM - call this rom the app.module, and make it initialize from the state
    // TODO: throw error, if the state doesn't have the necessary basic infos
    // this.appId = -1;
  }

  private sessionNumber(name: string): number {
    const result = sessionStorage.getItem(keyZoneId);
    if (result !== null) {
      const num = parseInt(result, 10);
      return isNaN(num) ? null : num;
    }
    return null;
  }

   /**
    * Get a number from the route, or optionally its parents.
    * @param {ActivatedRouteSnapshot} state
    * @param {string} name
    * @param {boolean} [recursive=false]
    * @returns {number}
    * @memberof Context
    */
   private routeNumber(state: ActivatedRouteSnapshot, name: string, recursive: boolean = false): number {
    // catch case where state is null, like when the recursive parent is in use
    if (state == null) { return null; }

    const result = state.paramMap.get(name);
    if (result !== null) {
      const num = parseInt(result, 10);
      return isNaN(num) ? null : num;
    }

    return recursive
      ? this.routeNumber(state.parent, name, true)
      : null;
  }


}
