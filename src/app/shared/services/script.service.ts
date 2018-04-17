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
        scriptElement.type = 'text/javascript';
        scriptElement.src = script.src;

        scriptElement.onload = () => {
          script.loaded = true;
          // script.template = this.divBox(2, 2);
          observer.next(script);
          observer.complete();
        };

        scriptElement.onerror = (error: any) => {
          observer.error('Couldnt load script ' + script.src);
        };

        document.getElementsByTagName('body')[0].appendChild(scriptElement);
      }
    });
  }

  // private divBox(col, row) {
  //   // console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  //   // let ret = '';
  //   // for (let r = 0; r < row; r++) {
  //   //   ret += '<div id="Column' + (r + 1) + '" style="float:left">';
  //   //   for (let c = 0; c < col; c++) {
  //   //     ret += '<div id="sq' + (r * col + c + 1) + '" style="width:40px; height:40px;">';
  //   //     ret += (r * col + c + 1); // just for showing
  //   //     ret += '</div>';
  //   //   }
  //   //   ret += '</div>';
  //   // }
  //   return '<button type="button" onclick="myFunction()">Try it</button>';
  // }
}

export interface ScriptModel {
  name: string;
  src: string;
  loaded: boolean;
  template: string;
}
