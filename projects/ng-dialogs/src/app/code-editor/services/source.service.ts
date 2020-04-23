import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { SourceView } from '../models/source-view.model';

@Injectable()
export class SourceService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /** Key is templateId or path */
  get(key: number | string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/asset'), {
      params: this.calcParams(key)
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
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/asset'), view, {
      params: this.calcParams(key),
    }) as Observable<boolean>;
  }

  calculateAceMode(extension: string) {
    const lower = extension.toLocaleLowerCase();
    switch (lower) {
      case '.cs':
        return 'csharp';
      case '.cshtml':
        return 'razor';
      default:
        return 'text';
    }
  }

  getTemplates() {
    // spm TODO: similar function exists in edit-ui
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/list'), {
      params: { appId: this.context.appId.toString(), global: 'false', withSubfolders: 'true' },
    }) as Observable<string[]>;
  }

  private calcParams(key: number | string) {
    if (typeof key === typeof 0) {
      return { templateId: key.toString() };
    } else {
      return { path: key as string };
    }
  }
}
