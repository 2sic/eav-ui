import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeatureState } from '../models/feature.model';
import { License, UploadInfo } from '../models/license.model';

const webApiFeatures = 'admin/feature/';
const webApiLicense = 'sys/license/';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  saveFeatures(featuresStates: FeatureState[]): Observable<null> {
    return this.http.post<null>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'SaveNew'), featuresStates);
  }

  getLicenses(): Observable<License[]> {
    return this.http.get<License[]>(this.dnnContext.$2sxc.http.apiUrl(webApiLicense + 'Summary'));
  }

  uploadLicense(file: File): Observable<UploadInfo> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<UploadInfo>(this.dnnContext.$2sxc.http.apiUrl(webApiLicense + 'Upload'), formData);
  }

  retrieveLicense(): Observable<UploadInfo> {
    return this.http.get<UploadInfo>(this.dnnContext.$2sxc.http.apiUrl(webApiLicense + 'Retrieve'));
  }
}
