import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { FileTypeConstants } from '../constants/file-type-constants';

@Injectable()
export class SvcCreatorService {
  // private creator = {};

  // construct a object which has liveListCache, liveListReload(), liveListReset(),
  implementLiveList = (getLiveList, disableToastr) => {

    const disableToastrValue = !!disableToastr;
    const liveListCache = [];                   // this is the cached list

    const liveListCacheIsLoaded = false;

    const getAllLive = () => {
      if (liveListCache.length === 0 && !liveListCacheIsLoaded) {
        liveListReload();
      }
      return liveListCache;
    };

    // use a promise-result to re-fill the live list of all items, return the promise again
    // const _liveListUpdateWithResult = function
    const updateLiveAll = (result) => {
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
      t.liveListCache.length = 0; // clear
      for (let i = 0; i < result.data.length; i++) {
        t.liveListCache.push(result.data[i]);
      }
      t.liveListCacheIsLoaded = true;
      return result;
    };

    const liveListSourceRead = getLiveList;

    const liveListReload = () => {
      // show loading - must use the promise-mode because this may be used early before the language has arrived
      return 'General.Messages.Loading';
      // $translate("General.Messages.Loading").then(function (msg) {
      //   t.msg = toastr.info(msg);
      // });
      // return t.liveListSourceRead()
      //   .then(t._liveListUpdateWithResult);
    };

    const liveListReset = () => {
      t.liveListCache = [];
    };

    const t = {
      disableToastrValue,
      liveListCache,
      liveListCacheIsLoaded,
      updateLiveAll,
      liveListSourceRead,
      liveListReload,
    };

    return t;
  }
}

// export interface ListType {
//   disableToastr: boolean;
//   liveListCache: any;
//   liveList: any;
//   isLoaded: boolean;
// }
