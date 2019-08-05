
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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

    public isFeatureEnabled = (guid: string): boolean => {
        let features: Feature[];
        this.selectFeatures().pipe(take(1)).subscribe(allFeatures => { features = allFeatures; });

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
