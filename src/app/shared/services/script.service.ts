import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class ScriptLoaderService {
  private scripts: ScriptModel[] = [];

  public load(script: ScriptModel): Observable<ScriptModel> {
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
        const scriptElement = document.createElement('script');
        scriptElement.type = 'module';
        scriptElement.src = script.src;

        scriptElement.onload = () => {
          script.loaded = true;
          // Settimeout for testing slow load of scripts
          setTimeout(() => {
            observer.next(script);
            observer.complete();
          }, 5000);
        };

        scriptElement.onerror = (error: any) => {
          observer.error('Couldnt load script ' + script.src);
        };

        document.getElementsByTagName('body')[0].appendChild(scriptElement);
      }
    });
  }

  public loadCss(script: ScriptModel): Observable<ScriptModel> {
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
        const scriptElement = document.createElement('link');
        scriptElement.rel = 'stylesheet';
        scriptElement.href = script.src;

        scriptElement.onload = () => {
          script.loaded = true;
          // Settimeout for testing slow load of scripts
          setTimeout(() => {
            observer.next(script);
            observer.complete();
          }, 5000);
        };

        scriptElement.onerror = (error: any) => {
          observer.error('Couldnt load stylesheet ' + script.src);
        };

        document.getElementsByTagName('head')[0].appendChild(scriptElement);
      }
    });
  }
}

export interface ScriptModel {
  name: string;
  src: string;
  loaded: boolean;
}
