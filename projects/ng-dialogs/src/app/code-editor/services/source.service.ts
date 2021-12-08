import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { webApiAppFile, webApiAppFileCreate, webApiAppFilesAll } from '../../../../../edit/shared/services';
import { keyIsShared } from '../../shared/constants/session.constants';
import { SourceItem } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { PredefinedTemplatesResponse } from '../models/predefined-template.model';
import { Preview } from '../models/preview.models';
import { SourceView } from '../models/source-view.model';

export const webApiAppFilesPredefinedTemplates = 'admin/appfiles/GetTemplates';
export const webApiAppFilesPreview = 'admin/appfiles/preview';

@Injectable()
export class SourceService {
  private isShared = sessionStorage.getItem(keyIsShared) ?? false.toString();

  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /** ViewKey is templateId or path */
  get(viewKey: string, urlItems: SourceItem[]): Observable<SourceView> {
    return this.http.get<SourceView>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFile), {
      params: {
        appId: this.context.appId.toString(),
        global: this.isShared,
        ...this.templateIdOrPath(viewKey, urlItems),
      }
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
  save(viewKey: string, view: SourceView, urlItems: SourceItem[]): Observable<boolean> {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFile), view, {
      params: {
        appId: this.context.appId.toString(),
        global: this.isShared,
        ...this.templateIdOrPath(viewKey, urlItems),
      },
    });
  }

  getTemplates(): Observable<string[]> {
    return this.http.get<string[]>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesAll), {
      params: { appId: this.context.appId.toString(), global: this.isShared, withSubfolders: 'true' },
    });
  }

  getPredefinedTemplates(purpose?: 'Template' | 'Search' | 'Api', type?: 'Token' | 'Razor'): Observable<PredefinedTemplatesResponse> {
    return this.http.get<PredefinedTemplatesResponse>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesPredefinedTemplates), {
      params: {
        ...(purpose && { purpose }),
        ...(type && { type }),
      },
    });
  }

  getPreview(path: string, templateKey: string): Observable<Preview> {
    return this.http.get<Preview>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesPreview), {
      params: {
        appId: this.context.appId.toString(),
        path,
        templateKey,
        global: this.isShared,
      },
    });
  }

  createTemplate(path: string, templateKey: string): Observable<boolean> {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFileCreate), {}, {
      params: {
        appId: this.context.appId.toString(),
        global: this.isShared,
        purpose: 'auto',
        path,
        templateKey,
      },
    });
  }

  private templateIdOrPath(viewKey: string, urlItems: SourceItem[]) {
    if (/^[0-9]*$/g.test(viewKey)) {
      const path = urlItems.find(i => i.EntityId?.toString() === viewKey)?.Path;
      return {
        templateId: viewKey,
        ...(path != null && { path }),
      };
    } else {
      return { path: viewKey };
    }
  }
}
