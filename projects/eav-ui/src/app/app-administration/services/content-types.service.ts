import { httpResource } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { transient } from 'projects/core';
import { filter, first, firstValueFrom, map } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { ScopeOption } from '../../shared/constants/eav.constants';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SysDataService } from '../../shared/services/sys-data.service';
import { ContentType, ContentTypeEdit } from '../models/content-type.model';
import { ScopeDetailsDto } from '../models/scopedetails.dto';

// We should list all the "full" paths here, so it's easier to find when searching for API calls
export const webApiTypeRoot = 'admin/type/';
const webApiTypes = 'admin/type/list';
const webApiTypeSave = 'admin/type/save';
const webApiTypeDelete = 'admin/type/delete';
const webApiTypeImport = 'admin/type/import';
const webApiTypeAddGhost = 'admin/type/addghost';

const dataSourceContentTypeDetails = 'System.ContentTypeDetails';
const dataSourceScopes = 'System.Scopes';

interface ScopeRaw {
  NameId: string;
  Name: string;
  TypesTotal: number;
  TypesInherited: number;
  TypesOfApp: number;
}

interface ScopesDataSourceResponse {
  Default?: ScopeRaw[];
}

@Injectable()
export class ContentTypesService extends HttpServiceBase {
  #sysData = transient(SysDataService);

  // TODO: @2dg, ask 2dm 
  // content-export.component.ts
  // content-import.component.ts
  // data.component.ts
  retrieveContentType(nameId: string) {
    const sig = this.#sysData.getFirst<ContentType>({
      source: dataSourceContentTypeDetails,
      params: {
        AppId: this.appId,
        ContentTypeId: nameId,
      },
      noCamel: true,
    });
    return toObservable(sig, { injector: this.injector }).pipe(
      filter(v => v != null),
      first()
    );
  }

  getType(nameId: string) {
    return this.#sysData.getFirst<ContentType>({
      source: dataSourceContentTypeDetails,
      params: {
        AppId: this.appId,
        ContentTypeId: nameId,
      },
      noCamel: true,
    });
  }
  getTypes(scope: Signal<string>) {
    return httpResource<ContentType[]>(() => ({
      url: this.apiUrl(webApiTypes),
      params: { appId: this.appId, scope: scope() }
    }), { defaultValue: [] });
  }

  retrieveContentTypesPromise(scope: string): Promise<ContentType[]> {
    return this.fetchPromise<ContentType[]>(webApiTypes, {
      params: { appId: this.appId, scope }
    });
  }

  getScopesPromise(): Promise<ScopeOption[]> {
    const resource = this.#sysData.getMany<ScopesDataSourceResponse>({
      source: dataSourceScopes,
      params: { AppId: this.appId },
      noCamel: true,
    });

    return firstValueFrom(toObservable(resource.value, { injector: this.injector }).pipe(
      filter(value => value != null),
      first(),
      map(streams => this.#mapScopeOptions(streams.Default ?? [])),
    ));
  }

  getScopesSig() {
    const scopes = this.#sysData.get<ScopeRaw>({
      source: dataSourceScopes,
      params: { AppId: this.appId },
      noCamel: true,
    });

    return computed(() => this.#mapScopeOptions(scopes()));
  }

  getScopesV2Promise(): Promise<ScopeDetailsDto[]> {
    const resource = this.#sysData.getMany<ScopesDataSourceResponse>({
      source: dataSourceScopes,
      params: { AppId: this.appId },
      noCamel: true,
    });

    return firstValueFrom(toObservable(resource.value, { injector: this.injector }).pipe(
      filter(value => value != null),
      first(),
      map(streams => this.#mapScopeDetails(streams.Default ?? [])),
    ));
  }

  save(contentType: ContentTypeEdit) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeSave), contentType, {
      params: { appid: this.appId },
    });
  }

  delete(contentType: ContentType) {
    return this.http.delete<boolean>(this.apiUrl(webApiTypeDelete), {
      params: { appid: this.appId, staticName: contentType.NameId }, // TODO: @2pp - replace staticName with NameId
    });
  }

  import(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('File', file);
    }
    return this.http.post<FileUploadResult>(this.apiUrl(webApiTypeImport), formData, {
      params: { appId: this.appId, zoneId: this.zoneId },
    });
  }

  createGhost(sourceNameId: string) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeAddGhost), null, {
      params: { appid: this.appId, sourceNameId },
    });
  }

  #mapScopeOptions(scopes: ScopeRaw[]): ScopeOption[] {
    return scopes.map(scope => ({
      name: scope.Name,
      value: scope.NameId,
    }));
  }

  #mapScopeDetails(scopes: ScopeRaw[]): ScopeDetailsDto[] {
    return scopes.map(scope => ({
      name: scope.NameId,
      typesTotal: scope.TypesTotal,
      typesInherited: scope.TypesInherited,
      typesOfApp: scope.TypesOfApp,
    }));
  }
}
