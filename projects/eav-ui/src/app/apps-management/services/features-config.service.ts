import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FeatureState } from '../../features/models';
import { FileUploadMessageTypes, FileUploadResult } from '../../shared/components/file-upload-dialog';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { License, LicenseDownloadInfo, LicenseUploadInfo } from '../models/license.model';

const webAPiLicenseRetrieve = 'sys/license/Retrieve';
const webApiFeatSaveNew = 'admin/feature/SaveNew';
const webApiLicSummary = 'sys/license/Summary';
const webApiUpload = 'sys/license/Upload';

@Injectable()
export class FeaturesConfigService extends HttpServiceBase {

  saveFeatures(featuresStates: FeatureState[]): Observable<null> {
    return this.http.post<null>(this.apiUrl(webApiFeatSaveNew), featuresStates);
  }

  getLicenses(): Observable<License[]> { // Use new Signals
    return this.getHttp<License[]>(this.apiUrl(webApiLicSummary));

  }

  uploadLicense(file: File): Observable<FileUploadResult> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<LicenseUploadInfo>(this.apiUrl(webApiUpload), formData)
      .pipe(
        map(info => ({
          Success: info.Success,
          Messages: [{
            MessageType: info.Success ? FileUploadMessageTypes.Success : FileUploadMessageTypes.Error,
            Text: `License ${info.Success ? 'uploaded' : 'upload failed'}: ${info.Message}`,
          }],
        } satisfies FileUploadResult)),
      );
  }

  retrieveLicense(): Observable<LicenseDownloadInfo> {
    return this.getHttp<LicenseDownloadInfo>(this.apiUrl(webAPiLicenseRetrieve));
  }
}
