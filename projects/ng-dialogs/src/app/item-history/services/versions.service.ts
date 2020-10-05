import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Context } from '../../shared/services/context';
import { RawVerJsonParsed, RawVersion } from '../models/raw-version.model';
import { VerAttribute, VerAttributeValue, Version } from '../models/version.model';

const webApiVersions = 'cms/history/';

@Injectable()
export class VersionsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  fetchVersions(entityId: number) {
    return this.http
      .post<RawVersion[]>(
        this.dnnContext.$2sxc.http.apiUrl(webApiVersions + 'get'),
        { entityId },
        {
          params: { appId: this.context.appId.toString() },
        },
      )
      .pipe(
        map(rawVersions => {
          const versions = rawVersions.map((rawVersion, index, allRawVersions) => {
            const previous = allRawVersions.find(v => v.VersionNumber === rawVersion.VersionNumber - 1);
            const previousJson: RawVerJsonParsed = previous ? JSON.parse(previous.Json) : null;
            const isLastVersion = !allRawVersions.some(v => v.VersionNumber === rawVersion.VersionNumber + 1);
            const json: RawVerJsonParsed = JSON.parse(rawVersion.Json);

            const verAttributes: VerAttribute[] = [];
            Object.entries(json.Entity.Attributes).forEach(([dataType, rawAttributes]) => {
              const attributes = Object.entries(rawAttributes).map(([attributeName, rawAttributeValues]) => {
                const attributeValues = Object.entries(rawAttributeValues).map(([langKey, value]) => {
                  const attributeValue: VerAttributeValue = {
                    langKey,
                    value,
                    hasChanged: JSON.stringify(value)
                      !== JSON.stringify(previousJson?.Entity.Attributes[dataType]?.[attributeName]?.[langKey]),
                  };
                  return attributeValue;
                });

                const attribute: VerAttribute = {
                  attributeName,
                  dataType,
                  expand: false,
                  hasChanged: JSON.stringify(rawAttributeValues)
                    !== JSON.stringify(previousJson?.Entity.Attributes[dataType]?.[attributeName]),
                  attributeValues,
                };
                return attribute;
              });
              verAttributes.push(...attributes);
            });

            const version: Version = {
              ChangeSetId: rawVersion.ChangeSetId,
              Attributes: verAttributes,
              HistoryId: rawVersion.HistoryId,
              TimeStamp: rawVersion.TimeStamp,
              User: rawVersion.User,
              VersionNumber: rawVersion.VersionNumber,
              _isLastVersion: isLastVersion,
            };
            return version;
          });
          return versions;
        }),
      );
  }

  restore(entityId: number, changeId: number) {
    return this.http.post<boolean>(
      this.dnnContext.$2sxc.http.apiUrl(webApiVersions + 'restore'),
      { entityId },
      {
        params: { appId: this.context.appId.toString(), changeId: changeId.toString() },
      },
    );
  }
}
