import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { FileTypeConstants } from '../constants/file-type-constants';

@Injectable()
export class SvcCreatorService {
  // construct a object which has liveListCache, liveListReload(), liveListReset(),
  constructor(private getLiveList, private disableToastr) { }

  disableToastrValue = !!this.disableToastr;
  liveListCache = []; // this is the cached list

  liveListCacheIsLoaded = false;
  liveListSourceRead = this.getLiveList();

  getAllLive = () => {
    if (this.liveListCache.length === 0 && !this.liveListCacheIsLoaded) {
      this.liveListReload();
    }
    return this.liveListCache;
  }

  liveListReload = () => {
    // show loading - must use the promise-mode because this may be used early before the language has arrived
    // return 'General.Messages.Loading';
    // $translate("General.Messages.Loading").then(function (msg) {
    //   t.msg = toastr.info(msg);
    // });
    return this.liveListSourceRead().subscribe(s => this.updateLiveAll(s));
  }

  liveListReset = () => {
    this.liveListCache = [];
  }

  // use a promise-result to re-fill the live list of all items, return the promise again
  // const _liveListUpdateWithResult = function
  private updateLiveAll = (result) => {
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
    this.liveListCache.length = 0; // clear
    for (let i = 0; i < result.data.length; i++) {
      this.liveListCache.push(result.data[i]);
    }
    this.liveListCacheIsLoaded = true;
    return result;
  }
}

