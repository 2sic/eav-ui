import { Injectable, SkipSelf, Optional } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { keyZoneId, keyAppId, keyTabId, keyContentBlockId, keyModuleId, keyRequestToken } from '../constants/sessions-keys';

/**
 * The context provides information
 *
 * @export
 * @class Context
 */
@Injectable()
export class Context {

  /** Id of current context */
  public id: number;

  /** Determines if the context is ready to use, and everything is initialized */
  public ready = false;

  /** The parent, for hierarchical lookup */
  private parent: Context;

  private routeSnapshot: ActivatedRouteSnapshot;

  /** The current Zone ID */
  get zoneId(): number {
    return this._zoneId || (this._zoneId = this.routeNum(keyZoneId) || this.parent.zoneId);
  }
  private _zoneId: number;

  /** The current App ID */
  get appId(): number {
    return this._appId || (this._appId = this.routeNum(keyAppId) || this.parent.appId);
  }
  private _appId: number;


  /**
   * The request verification token for http requests
   * It's only loaded from the root, never from sub-contexts
  */
  get requestToken(): string { return this._rvt || (this._rvt = this.parent.requestToken); }
  private _rvt: string;

  /** Tab Id is global */
  get tabId(): number {
    return this._tabId || (this._tabId = this.routeNum(keyTabId) || this.parent.tabId);
  }
  private _tabId: number;

  /** Content Block Id is global */
  get contentBlockId(): number {
    return this._contentBlockId || (this._contentBlockId = this.routeNum(keyContentBlockId) || this.parent.contentBlockId);
  }
  private _contentBlockId: number;

  /** Module Id is global */
  get moduleId(): number {
    return this._moduleId || (this._moduleId = this.routeNum(keyModuleId) || this.parent.moduleId);
  }
  private _moduleId: number;

  constructor(@Optional() @SkipSelf() parentContext: Context) {
    console.log('Context.constructor');
    this.parent = parentContext;

    // spm I've given id to every context to make it easier to follow how things work
    const globalWindow = <any>window;
    if (!globalWindow.contextId) { globalWindow.contextId = 0; }
    this.id = globalWindow.contextId++;
  }


  /**
   * This is the initializer at entry-componets of modules
   * It ensures that within that module, the context has the values given by the route
   *
   * @param {ActivatedRoute} route
   * @memberof Context
   */
  init(route: ActivatedRoute) {
    console.log('Context.init', route);
    this.routeSnapshot = route && route.snapshot;
    // clear cached values
    this._zoneId = null;
    this._appId = null;
    this._rvt = null;
    this._tabId = null;
    this._contentBlockId = null;
    this._moduleId = null;
    this.ready = route != null;
  }

  initRoot() {
    console.log('Context.initRoot');

    // required, global things
    this._rvt = sessionStorage.getItem(keyRequestToken);
    this._zoneId = this.sessionNumber(keyZoneId);
    this._tabId = this.sessionNumber(keyTabId);
    this._contentBlockId = this.sessionNumber(keyContentBlockId);
    this._moduleId = this.sessionNumber(keyModuleId);

    if (!this._rvt || !this._zoneId || !this._tabId || !this._contentBlockId || !this._moduleId) {
      throw new Error('Context is missing some of the required parameters');
    }

    // optional global things
    this._appId = this.sessionNumber(keyAppId);

    this.ready = true;
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
