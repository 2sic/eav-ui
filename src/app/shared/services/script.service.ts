import { Injectable } from '@angular/core';
import { Observable, Observer, zip } from 'rxjs';

import { FileTypeConstants } from '../constants/type-constants';

@Injectable()
export class ScriptLoaderService {
  private scripts: ScriptModel[] = [];

  public load(script: ScriptModel, fileType: string): Observable<ScriptModel> {
    return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
      // const existingScript = this.scripts.find(s => s.name === script.name);
      const existingScript = this.scripts.find(s => s.filePath === script.filePath);
      // Complete if already loaded
      if (existingScript) {
        if (existingScript.loaded) {
          observer.next(existingScript);
          observer.complete();
        } else {
          existingScript.htmlScriptElement.addEventListener('load', () => {
            observer.next(existingScript);
            observer.complete();
          });
        }
      } else {
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
        scriptElement.addEventListener('load', () => {
          script.loaded = true;
          observer.next(script);
          observer.complete();
        });

        scriptElement.onerror = (error: any) => {
          observer.error('Couldnt load script ' + script.filePath);
        };

        script.htmlScriptElement = scriptElement;

        // Add the script
        this.scripts.push(script);

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
  htmlScriptElement?: HTMLScriptElement;
}
