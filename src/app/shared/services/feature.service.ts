
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError, Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { UrlConstants } from '../constants/url-constants';
import * as fromStore from '../store';
import * as featureActions from '../store/actions/feature.actions';
import { Feature } from '../models/feature/feature';

@Injectable()
export class FeatureService {

    constructor(private httpClient: HttpClient, private store: Store<fromStore.EavState>) {
    }
    /**
     * Dispatch LoadItemsAction to store
     * @param path
     */
    public loadFeatures(features: any[]) {
        const featureList: Feature[] = Feature.createFeatureArray(features);
        this.store.dispatch(new featureActions.LoadFeaturesAction(featureList));
    }

    public selectFeatures(): Observable<Feature[]> {
        return this.store.select(fromStore.getFeatures);
    }

    public isEnabledNow = (features: Feature[], guid): boolean => {
        for (let i = 0; i < features.length; i++) {
            if (features[i].id === guid) {
                return features[i].enabled;
            }
        }
        return false;
    }

    private handleError(error: any) {
        // In a real world app, we might send the error to remote logging infrastructure
        const errMsg = error.message || 'Server error';
        console.error(errMsg);
        return throwError(errMsg);
    }
}
