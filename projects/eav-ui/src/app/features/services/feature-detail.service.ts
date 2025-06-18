import { Injectable, signal, Signal } from '@angular/core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { Feature } from '../models';

const webApiFeatureDetails = "admin/feature/details";
@Injectable()
export class FeatureDetailService extends HttpServiceBaseSignal {
  
  getFeatureDetail(nameId: Signal<string>) {
    return this.newHttpResource<Feature>(() => ({
      url: this.apiUrl(webApiFeatureDetails),
      params: { nameId: nameId() },
    }));
  }

  getFeatureDetails(nameIds: string[]): Signal<Feature[]> {
    const featureList = signal<Feature[]>([]);
    for (const nameId of nameIds) {

      this.fetchPromise<Feature>(webApiFeatureDetails, {
        params: { nameId }
      }).then(feature => {
        featureList.update(prev => [...prev, feature]);
      });
    }
    return featureList;
  }
}
