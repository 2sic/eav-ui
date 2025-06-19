import { httpResource } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WebApi, WebApiDetails } from '../../app-administration/models';
import { ViewOrFileIdentifier } from '../../shared/models/edit-form.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { FileAsset } from '../models/file-asset.model';
import { PredefinedTemplatesResponse } from '../models/predefined-template.model';
import { Preview } from '../models/preview.models';
import { SourceView } from '../models/source-view.model';

const appFilesAll = 'admin/AppFiles/AppFiles';
const appFilesAsset = 'admin/AppFiles/asset';
const appFilesCreate = 'admin/AppFiles/create';
const apiExplorerInspect = 'admin/ApiExplorer/inspect';
const apiExplorerAppApiFiles = 'admin/ApiExplorer/AppApiFiles';
const appFilesPredefinedTemplates = 'admin/AppFiles/GetTemplates';
const appFilesPreview = 'admin/AppFiles/preview';

@Injectable()
export class SourceService extends HttpServiceBase {

  // TODO: @2dg, ask 2dm 
  /** ViewKey is templateId or path */
  get(viewKey: string, global: boolean, urlItems: ViewOrFileIdentifier[]): Observable<SourceView> {
    return this.getHttpApiUrl<SourceView>(appFilesAsset, {
      params: {
        appId: this.appId,
        global,
        ...this.templateIdOrPath(viewKey, global, urlItems),
      },
    }).pipe(
      map(view => {
        if (view.Type.toLocaleLowerCase() === 'auto') {
          switch (view.Extension.toLocaleLowerCase()) {
            case '.cs':
            case '.cshtml':
              view.Type = 'Razor';
              break;
            case '.html':
            case '.css':
            case '.js':
              view.Type = 'Token';
              break;
          }
        }
        return view;
      })
    );
  }

  // TODO: @2dg, ask 2dm 
  // getSig(viewKey: string, global: boolean, urlItems: ViewOrFileIdentifier[], initial: undefined): Signal<SourceView> {
  //   // Signal für die SourceView erstellen
  //   const temp = this.getSignal<SourceView>(appFilesAsset, {
  //     params: {
  //       appId: this.appId,
  //       global,
  //       ...this.templateIdOrPath(viewKey, global, urlItems),
  //     },
  //   }, initial);
  //   return computed(() => {
  //     const result = temp();

  //     if (result && result.Type.toLocaleLowerCase() === 'auto') {
  //       switch (result.Extension.toLocaleLowerCase()) {
  //         case '.cs':
  //         case '.cshtml':
  //           result.Type = 'Razor';
  //           break;
  //         case '.html':
  //         case '.css':
  //         case '.js':
  //           result.Type = 'Token';
  //           break;
  //       }
  //     }

  //     return result;
  //   });
  // }


  /** ViewKey is templateId or path */
  save(viewKey: string, global: boolean, view: SourceView, urlItems: ViewOrFileIdentifier[]): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl(appFilesAsset), view, {
      params: {
        appId: this.appId,
        global,
        ...this.templateIdOrPath(viewKey, global, urlItems),
      },
    });
  }

  getAllPromise(mask?: string): Promise<FileAsset[]> {
    return this.fetchPromise<{ Files: FileAsset[] }>(appFilesAll, {
      params: {
        appId: this.appId,
        ...(mask && { mask }),
      },
    }).then(({ Files }) => {
      Files.forEach(file => {
        file.Shared ??= false;
      });
      return Files;
    });
  }

  // TODO: @2dg, ask 2dm
  getWebApis(): Observable<WebApi[]> {
    return this.getHttpApiUrl<{ files: WebApi[] }>(apiExplorerAppApiFiles, {
      params: {
        appId: this.appId,
      },
    }).pipe(
      map(({ files }) => {
        files.forEach(file => {
          file.isShared ??= false;
          file.isCompiled ??= false;
        });
        return files;
      }),
    ).pipe(
      map(files => {
        const webApis: WebApi[] = files.map(file => {
          const splitIndex = file.path.lastIndexOf('/');
          const fileExtIndex = file.path.lastIndexOf('.');
          const folder = file.path.substring(0, splitIndex);
          const name = file.path.substring(splitIndex + 1, fileExtIndex);
          const webApi: WebApi = { path: file.path, folder, name, isShared: file.isShared, endpointPath: file.endpointPath, isCompiled: file.isCompiled, edition: file.edition };
          return webApi;
        });
        return webApis;
      }),
    );
  }


  getWebApisLive(refresh: Signal<unknown>) {
    const apiResource = httpResource<{ files: WebApi[] }>(() => {
      refresh();
      return {
        url: this.apiUrl(apiExplorerAppApiFiles),
        params: { appId: this.appId },
      };
    });

    // Return a computed signal that transforms the data
    return computed(() => {
      const response = apiResource.value();
      const files = response?.files;

      if (!files) return [];

      // Set default values for isShared and isCompiled if they are undefined
      files.forEach(file => {
        file.isShared ??= false;
        file.isCompiled ??= false;
      });

      // Transform the raw files into the desired WebApi format
      return files.map(file => {
        const splitIndex = file.path.lastIndexOf('/');
        const fileExtIndex = file.path.lastIndexOf('.');
        const folder = file.path.substring(0, splitIndex);
        const name = file.path.substring(splitIndex + 1, fileExtIndex);

        return {
          path: file.path,
          folder,
          name,
          isShared: file.isShared,
          endpointPath: file.endpointPath,
          isCompiled: file.isCompiled,
          edition: file.edition,
        } as WebApi;
      });
    });
  }


  // TODO: @2dg, ask 2dm 
  getWebApiDetails(apiPath: string): Observable<WebApiDetails> {
    return this.getHttpApiUrl<WebApiDetails>(apiExplorerInspect, {
      params: { appId: this.appId, zoneId: this.zoneId, path: apiPath },
    });
  }

  getPredefinedTemplates(purpose?: 'Template' | 'Search' | 'Api', type?: 'Token' | 'Razor'): Promise<PredefinedTemplatesResponse> {
    return this.fetchPromise<PredefinedTemplatesResponse>(appFilesPredefinedTemplates, {
      params: {
        ...(purpose && { purpose }),
        ...(type && { type }),
      },
    });
  }

  // TODO: @2dg, ask 2dm 
  getPreview(path: string, global: boolean, templateKey: string): Observable<Preview> {
    return this.getHttpApiUrl<Preview>(appFilesPreview, {
      params: {
        appId: this.appId,
        path,
        templateKey,
        global,
      },
    });
  }

  create(path: string, global: boolean, templateKey: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl(appFilesCreate), {}, {
      params: {
        appId: this.appId,
        global,
        purpose: 'auto',
        path,
        templateKey,
      },
    });
  }

  private templateIdOrPath(viewKey: string, global: boolean, urlItems: ViewOrFileIdentifier[]) {
    if (/^[0-9]*$/g.test(viewKey)) {
      const path = urlItems.find(i => i.EntityId?.toString() === viewKey && i.IsShared === global)?.Path;
      return {
        templateId: viewKey,
        ...(path != null && { path }),
      };
    } else {
      return { path: viewKey };
    }
  }
}
