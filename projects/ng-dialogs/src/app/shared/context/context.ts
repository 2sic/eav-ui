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

  /** the parent, for hierarchical lookup */
  private parent: Context;

  private routeSnapshot: ActivatedRouteSnapshot;

  /** The current Zone ID */
  get zoneId(): number {
    return this._zoneId || (this._zoneId = this.routeNum(keyZoneId) || this.parent.zoneId );
  }
  private _zoneId: number;

  /** The current App ID */
  get appId(): number {
    return this._appId || (this._appId = this.routeNum(keyAppId) || this.parent.appId );
  }
  private _appId: number;


  /**
   * The request verification token for http requests
   * It's only loaded from the root, never from sub-contexts
  */
  get requestToken(): string { return this._rvt || (this._rvt = this.parent.requestToken); }
  private _rvt: string;

  // TODO: spm other "global" properties like

  constructor(@Optional() @SkipSelf() public context: Context) {
    console.log('Context.contstructor');
    if (context) { this.parent = context; }
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
    this.routeSnapshot = route.snapshot;
    this.ready = true;
  }

  // /**
  //  * Initialize this context from an existing parent.
  //  * This is used by child-contexts, which inherit values from the parent.
  //  * @private
  //  * @param {Context} parent
  //  * @memberof Context
  //  */
  // private initFromParentContext(parent: Context) {
  //   this.parent = parent;
  // }

  initRoot() {
    console.log('Context.initRoot');

    // required, global things
    this._rvt = sessionStorage.getItem(keyRequestToken);
    this._zoneId = this.sessionNumber(keyZoneId);

    // TODO: SPM - make it initialize all values from the state
    // TODO: throw error, if the state doesn't have the necessary basic infos

    // optional global things
    this._appId = this.sessionNumber(keyAppId);

  }

  private sessionNumber(name: string): number {
    const result = sessionStorage.getItem(name);
    if (result !== null) {
      const num = parseInt(result, 10);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * Get a number from the route, or optionally its parents.
   * @param {string} name
   * @returns {number} value in route or null
   * @memberof Context
   */
  private routeNum(name: string): number {
    // catch case where state is null, like when the recursive parent is in use
    if (this.routeSnapshot == null) { return null; }

    const result = this.routeSnapshot.paramMap.get(name);
    if (result !== null) {
      const num = parseInt(result, 10);
      return isNaN(num) ? null : num;
    }
  }


}
