import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { FileTypeConstants } from '../constants/file-type-constants';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchmap';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { from } from 'rxjs/observable/from';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SvcCreatorService {
  // construct a object which has liveListCache, liveListReload(), liveListReset(),
  constructor() { }

  implementLiveList(getLiveList$: Observable<any>, disableToastr: string) {

    const disableToastrValue = !!disableToastr;
    let liveListCacheIsLoaded = false;
    const liveListSourceRead$: Observable<any> = getLiveList$;

    const liveListCacheBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);
    const liveListCache$ = liveListCacheBehaviorSubject.asObservable();

    /**
     * Load live list action
     */
    const liveListLoad = () => {
      if (liveListCacheBehaviorSubject.getValue() && !liveListCacheIsLoaded) {
        liveListReload();
      }
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

      liveListSourceRead$.subscribe(s => updateLiveAll(s));
    };

    /**
     * Clear list
     */
    const liveListReset = () => {
      // liveListCache = [];
      liveListCacheBehaviorSubject.next([]);
    };

    // use a promise-result to re-fill the live list of all items, return the promise again
    // const _liveListUpdateWithResult = function
    const updateLiveAll = (result) => {
      console.log('updateLiveAll result:', result);
      console.log('liveListCache before:', liveListCacheBehaviorSubject.getValue());
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
      console.log('liveListCache after:', liveListCacheBehaviorSubject.getValue());
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

