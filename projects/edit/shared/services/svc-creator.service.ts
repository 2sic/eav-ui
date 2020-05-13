import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Injectable()
export class SvcCreatorService {
  // construct a object which has liveListCache, liveListReload(), liveListReset(),
  constructor() { }

  implementLiveList(getLiveList$: any, disableToastr: string) {

    const disableToastrValue = !!disableToastr;
    let liveListCacheIsLoaded = false;
    const liveListSourceRead$: any = getLiveList$;

    const liveListCacheBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);
    const liveListCache$ = liveListCacheBehaviorSubject.asObservable();

    // use a promise-result to re-fill the live list of all items, return the promise again
    // const _liveListUpdateWithResult = function
    const updateLiveAll = (result: any) => {
      // TODO:
      // if (t.msg.isOpened) {
      //   toastr.clear(t.msg);
      // }
      // else {
      //   $timeout(300).then(function () {
      //     toastr.clear(t.msg);
      //   }
      //   );
      // }
      // liveListCache.length = 0; // clear
      // liveListCache = [];
      // for (let i = 0; i < result.length; i++) {
      //   liveListCache.push(result[i]);
      // }
      liveListCacheBehaviorSubject.next(result);

      liveListCacheIsLoaded = true;
      angularConsoleLog('liveListCache after:', liveListCacheBehaviorSubject.getValue());
    };

    /**
     * Reload live list action
     */
    const liveListReload = () => {
      // show loading - must use the promise-mode because this may be used early before the language has arrived
      // return 'General.Messages.Loading';
      // $translate("General.Messages.Loading").then(function (msg) {
      //   t.msg = toastr.info(msg);
      // });
      liveListSourceRead$().subscribe((s: any) => updateLiveAll(s));
    };

    /**
     * Load live list action
     */
    const liveListLoad = () => {
      if (liveListCacheBehaviorSubject.getValue() && !liveListCacheIsLoaded) {
        liveListReload();
      }
    };

    /**
     * Clear list
     */
    const liveListReset = () => {
      // liveListCache = [];
      liveListCacheBehaviorSubject.next([]);
    };

    const svc = {
      disableToastrValue,
      liveListCache$,
      liveListCacheIsLoaded,
      liveListSourceRead$,
      liveListLoad,
      // getAllLive,
      liveListReload,
      liveListReset,
      updateLiveAll
    };

    return svc;
  }
}
