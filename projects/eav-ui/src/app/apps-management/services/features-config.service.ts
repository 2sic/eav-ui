import { computed, Injectable, Signal } from '@angular/core';
import { transient } from 'projects/core';
import { map, Observable } from 'rxjs';
import { Feature } from '../../features/models';
import { FileUploadMessageTypes, FileUploadResult } from '../../shared/components/file-upload-dialog';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { License, LicenseDownloadInfo, LicenseUploadInfo } from '../models/license.model';
import { FeatureConfigSavePackage } from './feature-config-save-package';

const webAPiLicenseRetrieve = 'sys/license/Retrieve';
const webApiFeatSaveNew = 'admin/feature/SaveNew';
const dataSourceLicenses = 'System.Licenses';
const dataSourceFeatureStates = 'System.FeatureStates';

interface LicenseRaw {
  AutoEnable: boolean;
  Description: string;
  Expiration: string;
  FeatureLicense: boolean;
  Guid: string;
  IsEnabled: boolean;
  NameId: string;
  Priority: number;
  Name: string;
}

interface FeatureStateRaw {
  AllowUse: boolean;
  Behavior: Feature['behavior'];
  Configuration?: string;
  ConfigurationContentType?: string;
  Description: string;
  EnabledByDefault: boolean;
  EnabledInConfiguration: boolean | null;
  EnabledReason: string;
  EnabledReasonDetailed: string;
  Expiration: string;
  Guid: string;
  IsConfigurable: boolean;
  IsEnabled: boolean;
  LicenseName: string;
  Link: string;
  Name: string;
  NameId: string;
  SecurityImpact?: number;
  SecurityMessage?: string;
}
const webApiUpload = 'sys/license/Upload';

@Injectable()
export class FeaturesConfigService extends HttpServiceBaseSignal {

  saveFeatures(featuresStates: FeatureConfigSavePackage[]): Observable<null> {
    return this.http.post<null>(this.apiUrl(webApiFeatSaveNew), featuresStates);
  }
  #sysData = transient(SysDataService);


  getLicensesLive(refresh: Signal<unknown>) {
    const licenses = this.#sysData.get<LicenseRaw>({
      source: dataSourceLicenses,
      refresh,
      noCamel: true,
    });

    // Build the CSV from a typed key map so it stays aligned with FeatureStateRaw.
    // This syntax ensures that if a new field is added to FeatureStateRaw, the compiler will force us to list it as well.
    // Note that this is necessary, because the GUID would not be included in the response by default.
    // Maybe that behavior will change some day. 
    const featureStateRawFields = Object.keys({
      Guid: true,
      Name: true,
      NameId: true,
      Description: true,
      IsEnabled: true,
      LicenseName: true,
      EnabledByDefault: true,
      EnabledInConfiguration: true,
      EnabledReason: true,
      EnabledReasonDetailed: true,
      Expiration: true,
      AllowUse: true,
      Behavior: true,
      Configuration: true,
      ConfigurationContentType: true,
      IsConfigurable: true,
      SecurityImpact: true,
      SecurityMessage: true,
      Link: true,
    } satisfies Record<keyof FeatureStateRaw, boolean>).join(',');

    const features = this.#sysData.get<FeatureStateRaw>({
      source: dataSourceFeatureStates,
      refresh,
      params: { All: true },
      fields: featureStateRawFields,
      noCamel: true,
    });

    return {
      value: computed(() => licenses()
        .filter(license => !license.FeatureLicense)
        .map(license => ({
          AutoEnable: license.AutoEnable,
          Description: license.Description,
          Expires: license.Expiration,
          Features: features()
            .filter(feature => feature.LicenseName === license.Name || feature.LicenseName === license.NameId)
            .map(feature => this.#mapFeature(feature)),
          Guid: license.Guid,
          IsEnabled: license.IsEnabled,
          Name: license.Name,
          Priority: license.Priority,
        } satisfies License))),
    };
  }

  #mapFeature(feature: FeatureStateRaw): Feature & { configuration?: Record<string, unknown> } {
    return {
      allowUse: feature.AllowUse,
      behavior: feature.Behavior,
      configuration: this.#parseConfiguration(feature.Configuration),
      configurationContentType: feature.ConfigurationContentType,
      description: feature.Description,
      enabledByDefault: feature.EnabledByDefault,
      enabledInConfiguration: feature.EnabledInConfiguration,
      enabledReason: feature.EnabledReason,
      enabledReasonDetailed: feature.EnabledReasonDetailed,
      expiration: feature.Expiration,
      guid: feature.Guid,
      isConfigurable: feature.IsConfigurable,
      isEnabled: feature.IsEnabled,
      link: feature.Link,
      name: feature.Name,
      nameId: feature.NameId,
      security: {
        Impact: feature.SecurityImpact ?? 0,
        Message: feature.SecurityMessage ?? '',
      },
    };
  }

  #parseConfiguration(configuration?: string): Record<string, unknown> | undefined {
    if (!configuration)
      return undefined;
    try {
      return JSON.parse(configuration) as Record<string, unknown>;
    } catch {
      return undefined;
    }
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

  retrieveLicensePromise(): Promise<LicenseDownloadInfo> {
    return this.fetchPromise<LicenseDownloadInfo>(webAPiLicenseRetrieve, {
    });
  }
}
