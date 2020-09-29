import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppFile, webApiAppFileCreate, webApiAppFilesAll } from 'projects/edit';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Context } from '../../shared/services/context';
import { SourceView } from '../models/source-view.model';

@Injectable()
export class SourceService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /** Key is templateId or path */
  get(key: number | string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppFile), {
      params: { appId: this.context.appId.toString(), ...this.templateIdOrPath(key) }
    }).pipe(
      map((view: SourceView) => {
        if (view.Type.toLowerCase() === 'auto') {
          switch (view.Extension.toLowerCase()) {
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
    ) as Observable<SourceView>;
  }

  /** Key is templateId or path */
  save(key: number | string, view: SourceView) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiAppFile), view, {
      params: { appId: this.context.appId.toString(), ...this.templateIdOrPath(key) },
    }) as Observable<boolean>;
  }

  getTemplates() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesAll), {
      params: { appId: this.context.appId.toString(), global: 'false', withSubfolders: 'true' },
    }) as Observable<string[]>;
  }

  createTemplate(name: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiAppFileCreate), {}, {
      params: { appId: this.context.appId.toString(), global: 'false', path: name },
    }) as Observable<boolean>;
  }

  private templateIdOrPath(key: number | string) {
    if (typeof key === typeof 0) {
      return { templateId: key.toString() };
    } else {
      return { path: key as string };
    }
  }
}
