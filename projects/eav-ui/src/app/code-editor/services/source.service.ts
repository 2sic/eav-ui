import { computed, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, filter, first, map, Observable, of } from 'rxjs';
import { transient } from '../../../../../core';
import { WebApi, WebApiControllerDetails, WebApiControllerEndpoint, WebApiControllerParameter, WebApiSecurity } from '../../app-administration/models';
import { ViewOrFileIdentifier } from '../../shared/models/edit-form.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SysDataService } from '../../shared/services/sys-data.service';
import { FileAsset } from '../models/file-asset.model';
import { PredefinedTemplatesResponse } from '../models/predefined-template.model';
import { Preview } from '../models/preview.models';
import { SourceView } from '../models/source-view.model';

const appFilesAll = 'admin/AppFiles/AppFiles';
const appFilesAsset = 'admin/AppFiles/asset';
const appFilesCreate = 'admin/AppFiles/create';
const appFilesPredefinedTemplates = 'admin/AppFiles/GetTemplates';
const appFilesPreview = 'admin/AppFiles/preview';
const dataSourceAppWebApiControllers = 'System.AppWebApiControllers';
const dataSourceAppWebApiControllerDetails = 'System.AppWebApiControllerDetails';
const dataSourceAppWebApiControllerEndpoints = 'System.AppWebApiControllerEndpoints';

interface AppWebApiControllerRow {
  Path: string;
  EndpointPath: string;
  Edition: string;
  Shared: boolean;
}

type WebApiControllerDetailsResponse = { Default?: WebApiControllerDetailsRaw[] };
type WebApiControllerEndpointsResponse = { Default?: WebApiControllerEndpointRaw[] };

type WebApiControllerDetailsRaw = {
  controller?: string;
  path?: string;
  ignoreSecurity?: boolean;
  allowAnonymous?: boolean;
  requireVerificationToken?: boolean;
  validateAntiForgeryToken?: boolean;
  autoValidateAntiforgeryToken?: boolean;
  ignoreAntiforgeryToken?: boolean;
  view?: boolean;
  edit?: boolean;
  admin?: boolean;
  superUser?: boolean;
  requireContext?: boolean;
};

type WebApiControllerEndpointRaw = {
  name?: string;
  endpointPath?: string;
  returns?: string;
  verbs?: string;
  parameters?: WebApiControllerParameter[];
  security?: WebApiSecurity;
  ignoreSecurity?: boolean;
  allowAnonymous?: boolean;
  requireVerificationToken?: boolean;
  view?: boolean;
  edit?: boolean;
  admin?: boolean;
  superUser?: boolean;
  requireContext?: boolean;
};

@Injectable()
export class SourceService extends HttpServiceBase {
  #sysData = transient(SysDataService);

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
    const resource = this.#sysData.getMany<{ Default?: AppWebApiControllerRow[] }>({
      params: {
        AppId: this.appId,
      },
      source: dataSourceAppWebApiControllers,
      streams: 'Default',
      noCamel: true,
    });

    return toObservable(resource.value, { injector: this.injector }).pipe(
      filter(v => v != null),
      map(streams => this.#mapWebApiRows(streams.Default ?? [])),
    );
  }


  getWebApisLive(refresh: Signal<unknown>) {
    const resource = this.#sysData.getMany<{ Default?: AppWebApiControllerRow[] }>({
      refresh,
      source: dataSourceAppWebApiControllers,
      params: {
        AppId: this.appId,
      },
      streams: 'Default',
      noCamel: true,
    });

    return computed(() => this.#mapWebApiRows(resource.value()?.Default ?? []));
  }

  #mapWebApiRows(rows: AppWebApiControllerRow[]): WebApi[] {
    return rows.map(row => {
      const splitIndex = row.Path.lastIndexOf('/');
      const fileExtIndex = row.Path.lastIndexOf('.');
      const folder = row.Path.substring(0, splitIndex);
      const name = row.Path.substring(splitIndex + 1, fileExtIndex);

      return {
        path: row.Path,
        folder,
        name,
        isShared: row.Shared,
        endpointPath: row.EndpointPath,
        isCompiled: false,
        edition: row.Edition,
      };
    });
  }


  retrieveWebApiControllerDetails(path: string): Observable<WebApiControllerDetails | null> {
    const resource = this.#sysData.getMany<WebApiControllerDetailsResponse>({
      source: dataSourceAppWebApiControllerDetails,
      params: {
        AppId: this.appId,
        Path: path,
      },
      streams: 'Default',
      noCamel: true,
    });

    return toObservable(resource.value, { injector: this.injector }).pipe(
      filter(value => value != null),
      map(streams => this.#mapWebApiControllerDetails(streams.Default?.[0] ?? null)),
      catchError(error => {
        console.error('Error loading WebApi controller details', error);
        return of(null);
      }),
      first(),
    );
  }

  retrieveWebApiControllerEndpoints(path: string): Observable<WebApiControllerEndpoint[]> {
    const resource = this.#sysData.getMany<WebApiControllerEndpointsResponse>({
      source: dataSourceAppWebApiControllerEndpoints,
      params: {
        AppId: this.appId,
        Path: path,
      },
      streams: 'Default',
      noCamel: true,
    });

    return toObservable(resource.value, { injector: this.injector }).pipe(
      filter(value => value != null),
      map(streams => (streams.Default ?? []).map(endpoint => this.#mapWebApiControllerEndpoint(endpoint))),
      catchError(error => {
        console.error('Error loading WebApi controller endpoints', error);
        return of([]);
      }),
      first(),
    );
  }

  #mapWebApiControllerDetails(details: WebApiControllerDetailsRaw | null): WebApiControllerDetails | null {
    if (details == null)
      return null;

    const {
      controller = '',
      path = '',
      ignoreSecurity = false,
      allowAnonymous = false,
      requireVerificationToken = false,
      validateAntiForgeryToken = false,
      autoValidateAntiforgeryToken = false,
      ignoreAntiforgeryToken = false,
      view = false,
      edit = false,
      admin = false,
      superUser = false,
      requireContext = false,
    } = details;

    return {
      Controller: controller,
      Path: path,
      IgnoreSecurity: ignoreSecurity,
      AllowAnonymous: allowAnonymous,
      RequireVerificationToken: requireVerificationToken,
      ValidateAntiForgeryToken: validateAntiForgeryToken,
      AutoValidateAntiforgeryToken: autoValidateAntiforgeryToken,
      IgnoreAntiforgeryToken: ignoreAntiforgeryToken,
      View: view,
      Edit: edit,
      Admin: admin,
      SuperUser: superUser,
      RequireContext: requireContext,
    };
  }

  #mapWebApiControllerEndpoint(endpoint: WebApiControllerEndpointRaw): WebApiControllerEndpoint {
    const {
      name = '',
      endpointPath = '',
      returns = '',
      verbs = '',
      parameters = [],
      security,
      ignoreSecurity = false,
      allowAnonymous = false,
      requireVerificationToken = false,
      view = false,
      edit = false,
      admin = false,
      superUser = false,
      requireContext = false,
    } = endpoint;

    return {
      Name: name,
      EndpointPath: endpointPath,
      Returns: returns,
      Verbs: verbs,
      Parameters: parameters,
      Security: security,
      IgnoreSecurity: ignoreSecurity,
      AllowAnonymous: allowAnonymous,
      RequireVerificationToken: requireVerificationToken,
      View: view,
      Edit: edit,
      Admin: admin,
      SuperUser: superUser,
      RequireContext: requireContext,
    };
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
