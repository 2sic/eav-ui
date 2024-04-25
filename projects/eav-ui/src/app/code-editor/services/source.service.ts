import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WebApi, WebApiDetails } from '../../app-administration/models';
import { ViewOrFileIdentifier } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
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
export class SourceService {

  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /** ViewKey is templateId or path */
  get(viewKey: string, global: boolean, urlItems: ViewOrFileIdentifier[]): Observable<SourceView> {
    return this.http.get<SourceView>(this.dnnContext.$2sxc.http.apiUrl(appFilesAsset), {
      params: {
        appId: this.context.appId,
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

  /** ViewKey is templateId or path */
  save(viewKey: string, global: boolean, view: SourceView, urlItems: ViewOrFileIdentifier[]): Observable<boolean> {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(appFilesAsset), view, {
      params: {
        appId: this.context.appId,
        global,
        ...this.templateIdOrPath(viewKey, global, urlItems),
      },
    });
  }

  getAll(mask?: string): Observable<FileAsset[]> {
    return this.http.get<{ Files: FileAsset[] }>(this.dnnContext.$2sxc.http.apiUrl(appFilesAll), {
      params: {
        appId: this.context.appId,
        ...(mask && { mask }),
      },
    }).pipe(
      map(({ Files }) => {
        Files.forEach(file => {
          file.Shared ??= false;
        });
        return Files;
      }),
    );
  }

  getWebApis(): Observable<WebApi[]> {
    return this.http.get<{ files: WebApi[] }>(this.dnnContext.$2sxc.http.apiUrl(apiExplorerAppApiFiles), {
      params: {
        appId: this.context.appId,
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

  getWebApiDetails(apiPath: string): Observable<WebApiDetails> {
    return this.http.get<WebApiDetails>(this.dnnContext.$2sxc.http.apiUrl(apiExplorerInspect), {
      params: { appId: this.context.appId, zoneId: this.context.zoneId, path: apiPath },
    });
  }

  getPredefinedTemplates(purpose?: 'Template' | 'Search' | 'Api', type?: 'Token' | 'Razor'): Observable<PredefinedTemplatesResponse> {
    return this.http.get<PredefinedTemplatesResponse>(this.dnnContext.$2sxc.http.apiUrl(appFilesPredefinedTemplates), {
      params: {
        ...(purpose && { purpose }),
        ...(type && { type }),
      },
    });
  }

  getPreview(path: string, global: boolean, templateKey: string): Observable<Preview> {
    return this.http.get<Preview>(this.dnnContext.$2sxc.http.apiUrl(appFilesPreview), {
      params: {
        appId: this.context.appId,
        path,
        templateKey,
        global,
      },
    });
  }

  create(path: string, global: boolean, templateKey: string): Observable<boolean> {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(appFilesCreate), {}, {
      params: {
        appId: this.context.appId,
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
