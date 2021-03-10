import { Injectable, Optional, SkipSelf } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { keyAppId, keyContentBlockId, keyModuleId, keyRequestToken, keyTabId, keyZoneId, prefix } from '../constants/session.constants';
import { consoleLogAngular } from '../helpers/angular-console-log.helper';

/** The context provides information */
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
    return (this._appId != null) ? this._appId : (this._appId = this.routeNum(keyAppId) || this.parent.appId);
  }
  private _appId: number;

  /**
   * The request verification token for http requests.
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
    this.parent = parentContext;

    // spm NOTE: I've given id to every context to make it easier to follow how things work
    const globalWindow = window as any;
    if (!globalWindow.contextId) { globalWindow.contextId = 0; }
    this.id = globalWindow.contextId++;
    consoleLogAngular('Context.constructor', this);
  }

  /**
   * This is the initializer at entry-componets of modules.
   * It ensures that within that module, the context has the values given by the route
   */
  init(route: ActivatedRoute) {
    this.routeSnapshot = route && route.snapshot;
    this.clearCachedValues();
    this.ready = route != null;
    consoleLogAngular('Context.init', this, route);
  }

  initRoot() {
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
    consoleLogAngular('Context.initRoot', this);
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
   * Returns value in route or null
   */
  private routeNum(name: string): number {
    // catch case where state is null, like when the recursive parent is in use
    if (this.routeSnapshot == null) { return null; }

    const paramName = name.substring(prefix.length);
    const result = this.routeSnapshot.paramMap.get(paramName);
    if (result !== null) {
      const num = parseInt(result, 10);
      return isNaN(num) ? null : num;
    }
  }

  /**
   * Clears cached values. Required when one module instance is opened multiple times,
   * e.g. Apps Management -> App Admin for appId 2 -> back -> App Admin for appId 17.
   * Module is reused, and so is context and it contains values for previous appId.
   */
  private clearCachedValues() {
    this._zoneId = null;
    this._appId = null;
    this._rvt = null;
    this._tabId = null;
    this._contentBlockId = null;
    this._moduleId = null;
  }
}
