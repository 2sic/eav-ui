import { Injectable, signal, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Feature } from '../models';

const webApiFeatureDetails = "admin/feature/details";
//TODO: 2dg change httpRe
@Injectable()
export class FeatureDetailService extends HttpServiceBase {
  getFeatureDetail(nameId: Signal<string>) {
    return this.newHttpResource<Feature>(() => ({
      url: this.apiUrl(webApiFeatureDetails),
      params: { nameId: nameId() },
    }));
  }

  getFeatureDetails(nameIds: string[]): Signal<Feature[]> {
    const featureList = signal<Feature[]>([]);
    for (const nameId of nameIds) {
      this.temp(nameId).subscribe(feature => {
        featureList.update(prev => [...prev, feature]);
      });
    }
    return featureList;
  }

  // TODO: Daniel fragen, getFeatureDetails(nameIds: string[]) ist nicht korrekt
  // getFeatureDetails(nameIds: string[]): Signal<Feature[]> {
  //   console.log('getFeatureDetails', nameIds);
  //   const featureList = signal<Feature[]>([]);
  //   for (const nameId of nameIds) {
  //   console.log('getFeatureDetails', nameId);


  //     const x = this.getFeatureDetail(nameId) ;
  //     featureList.update(prev => [...prev, x()]);
  //   }
  //   return featureList;
  // }

  // Remove later
  private temp(nameId: string): Observable<Feature> {
    return this.getHttpApiUrl<Feature>(webApiFeatureDetails, {
      params: { nameId }
    });
  }
}
