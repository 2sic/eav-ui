import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FeatureState } from '../../features/models';
import { FileUploadMessageTypes, FileUploadResult } from '../../shared/components/file-upload-dialog';
import { License, LicenseDownloadInfo, LicenseUploadInfo } from '../models/license.model';

const webApiLicense = 'sys/license/';
const webApiFeatSaveNew = 'admin/feature/SaveNew';
const webApiLicSummary = 'sys/license/Summary';
const webApiUpload = 'sys/license/Upload';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  saveFeatures(featuresStates: FeatureState[]): Observable<null> {
    return this.http.post<null>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatSaveNew), featuresStates);
  }

  getLicenses(): Observable<License[]> {
    return this.http.get<License[]>(this.dnnContext.$2sxc.http.apiUrl(webApiLicSummary));
  }

  uploadLicense(file: File): Observable<FileUploadResult> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http
      .post<LicenseUploadInfo>(this.dnnContext.$2sxc.http.apiUrl(webApiUpload), formData)
      .pipe(
        map(info => {
          const result: FileUploadResult = {
            Success: info.Success,
            Messages: [{
              MessageType: info.Success ? FileUploadMessageTypes.Success : FileUploadMessageTypes.Error,
              Text: `License ${info.Success ? 'uploaded' : 'upload failed'}: ${info.Message}`,
            }],
          };
          return result;
        }),
      );
  }

  retrieveLicense(): Observable<LicenseDownloadInfo> {
    return this.http.get<LicenseDownloadInfo>(this.dnnContext.$2sxc.http.apiUrl(webApiLicense + 'Retrieve'));
  }
}
