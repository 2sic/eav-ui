import { computed, Injectable, Signal } from '@angular/core';
import { transient } from '../../../../../core';
import { AppInternals } from '../../app-administration/models/app-internals.model';
import { SysDataService } from '../../shared/services/sys-data.service';

interface AppEnhancementsStreams {
  AppResources: AppInternals['EntityLists']['AppResources'];
  AppSettings: AppInternals['EntityLists']['AppSettings'];
  AppResourceFields: AppInternals['FieldAll']['AppResources'];
  AppSettingFields: AppInternals['FieldAll']['AppSettings'];
  Metadata: AppInternals['MetadataList']['Items'];
  ResourcesSystem: AppInternals['EntityLists']['ResourcesSystem'];
  SettingsSystem: AppInternals['EntityLists']['SettingsSystem'];
  ToSxcContentApp: AppInternals['EntityLists']['ToSxcContentApp'];
}

@Injectable()
export class AppInternalsService {
  #sysData = transient(SysDataService);

  getAppInternalsLive(refresh: Signal<unknown>) {
    const resource = this.#sysData.getMany<AppEnhancementsStreams>({
      source: 'System.AppEnhancements',
      refresh,
      streams: '*',
      noCamel: true,
    });

    // Keep the existing view-model shape while the backend is supplied by named DataSource streams.
    return {
      value: computed(() => {
        const streams = resource.value();
        if (!streams)
          return undefined;

        return {
          EntityLists: {
            AppResources: streams.AppResources,
            AppSettings: streams.AppSettings,
            ResourcesSystem: streams.ResourcesSystem,
            SettingsSystem: streams.SettingsSystem,
            ToSxcContentApp: streams.ToSxcContentApp,
          },
          FieldAll: {
            AppResources: streams.AppResourceFields,
            AppSettings: streams.AppSettingFields,
          },
          MetadataList: { Items: streams.Metadata } as AppInternals['MetadataList'],
        } satisfies AppInternals;
      }),
    };
  }
}