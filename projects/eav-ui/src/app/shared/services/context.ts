import { Injectable, Optional, SkipSelf } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { keyAppId, keyContentBlockId, keyModuleId, keyZoneId, prefix } from '../constants/session.constants';
import { classLog } from '../logging';
import { EavWindow } from '../models/eav-window.model';
import { RouteContextInfo } from '../routing/route-context-info';

declare const window: EavWindow;

const logSpecs = {
  all: false,
  constructor: false,
  init: false,
  initRoot: false,
};

/**
 * Context is used to display information about the current app in various depths.
 * In other words, if you open another app in a deeper dialog in the app on Apps Management
 * (the component is deeper), you get the information from this app and not the initial app.
 */
@Injectable()
export class Context implements RouteContextInfo {

  log = classLog({Context}, logSpecs);

  constructor(@Optional() @SkipSelf() parentContext: Context) {
    this.log.a(`constructor; hasParent: ${parentContext != null}`, { parentContext, 'parentId': parentContext?.id });
    this.parent = parentContext;

    // spm NOTE: I've given id to every context to make it easier to follow how things work
    if (!window.contextId)
      window.contextId = 0;
    this.id = window.contextId++;
    this.log.a('Context.constructor', { this: this });
  }

  /** Id of current context */
  public id: number;

  /** Determines if the context is ready to use, and everything is initialized */
  public ready = false;

  /** The parent, for hierarchical lookup */
  private parent: Context;

  private routeSnapshot: ActivatedRouteSnapshot;

  /** The current Zone ID */
  get zoneId(): number {
    return this._zoneId || (this._zoneId = this.#routeNum(keyZoneId) || this.parent?.zoneId);
  }
  private _zoneId: number;

  /** The current App ID */
  get appId(): number {
    return (this._appId != null) ? this._appId : (this._appId = this.#routeNum(keyAppId) || this.parent?.appId);
  }
  private _appId: number;


  /** Tab Id is global */
  get tabId(): number {
    return window.$2sxc.env.page();
  }

  /** Content Block Id is global */
  get contentBlockId(): number {
    return this._contentBlockId || (this._contentBlockId = this.#routeNum(keyContentBlockId) || this.parent?.contentBlockId);
  }
  private _contentBlockId: number;

  /** Module Id is global */
  get moduleId(): number {
    return this._moduleId || (this._moduleId = this.#routeNum(keyModuleId) || this.parent?.moduleId);
  }
  private _moduleId: number;

  /**
   * This is the initializer at entry-components of modules.
   * It ensures that within that module, the context has the values given by the route.
   *
   * Note: 2024-07-01 2dm: a long time ago the context was recreated for every single component, so init was also called for every component.
   * But after going standalone, thi doesn't happen any more, and the re-init seems to kill the context from previous,
   * which is why we skip this if already ready.
   * This is still a bit shaky, not sure if this should be the final implementation.
   */
  init(route: ActivatedRoute) {
    const l = this.log.fnIf('init', { route }, `- previously ready: '${this.ready}'`);
    // New prevent-multiple-init checks 2dm 2024-07-01
    if (this.ready)
      return l.r(this, 'Already ready, skipping init');
    this.routeSnapshot = route?.snapshot;
    this.#clearCachedValues();
    this.ready = route != null;
    this.log.a('init done', { this: this, 'appId': this.appId, 'zoneId': this.zoneId, 'contentBlockId': this.contentBlockId, 'moduleId': this.moduleId });
  }

  initRoot(): void {
    const l = this.log.fnIf('initRoot');
    this._zoneId = this.#sessionNumber(keyZoneId);
    this._contentBlockId = this.#sessionNumber(keyContentBlockId);
    this._moduleId = this.#sessionNumber(keyModuleId);
    this._appId = this.#sessionNumber(keyAppId);

    if (!this._zoneId)
      throw new Error('Context is missing some of the required parameters');

    this.ready = true;
    l.r(this);
  }

  #sessionNumber(name: string): number {
    const result = sessionStorage.getItem(name);
    if (result === null) return null;
    const num = parseInt(result, 10);
    return isNaN(num) ? null : num;
  }

  /**
   * Get a number from the route, or optionally its parents.
   * Returns value in route or null
   */
  #routeNum(name: string): number {
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
  #clearCachedValues() {
    this._zoneId = null;
    this._appId = null;
    this._contentBlockId = null;
    this._moduleId = null;
  }
}
