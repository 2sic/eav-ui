import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { FileTypeConstants } from '../constants/file-type-constants';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { zip } from 'rxjs/observable/zip';
import { of } from 'rxjs/observable/of';

@Injectable()
export class ScriptLoaderService {
  private scripts: ScriptModel[] = [];

  public load(script: ScriptModel, fileType: string): Observable<ScriptModel> {
    return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
      const existingScript = this.scripts.find(s => s.name === script.name);

      // Complete if already loaded
      if (existingScript && existingScript.loaded) {
        observer.next(existingScript);
        observer.complete();
      } else {
        // Add the script
        this.scripts = [...this.scripts, script];
        // Load the script
        let scriptElement;

        switch (fileType) {
          case FileTypeConstants.css:
            // Load the style
            scriptElement = document.createElement('link');
            scriptElement.rel = 'stylesheet';
            scriptElement.href = script.filePath;
            break;
          case FileTypeConstants.javaScript:
            scriptElement = document.createElement('script');
            scriptElement.type = 'module';
            scriptElement.src = script.filePath;
            break;
          default:
            console.log('wrong file type');
            break;
        }

        scriptElement.onload = () => {
          script.loaded = true;
          // Settimeout for testing slow load of scripts
          // setTimeout(() => {
          observer.next(script);
          observer.complete();
          // }, 5000);
        };

        scriptElement.onerror = (error: any) => {
          observer.error('Couldnt load script ' + script.filePath);
        };

        document.getElementsByTagName('head')[0].appendChild(scriptElement);
      }
    });
  }

  public loadList(scriptList: ScriptModel[], fileType: string): Observable<ScriptModel[]> {
    const allScripts$: Observable<ScriptModel>[] = [];
    scriptList.forEach((scriptModel: ScriptModel) => {
      allScripts$.push(this.load(scriptModel, fileType));
    });
    return allScripts$.length > 0
      ? zip(...allScripts$)
      : null;
  }
}

export interface ScriptModel {
  name: string;
  filePath: string;
  loaded: boolean;
}
