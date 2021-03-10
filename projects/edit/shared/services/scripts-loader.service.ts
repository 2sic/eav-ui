import { Injectable } from '@angular/core';
import { EavService } from '.';
import { UrlHelpers } from '../helpers';

declare const sxcVersion: string;

export enum FileTypeConstants {
  CSS = '.css',
  JS = '.js',
}

export interface LoadFile {
  path: string;
  type: string;
  loaded: boolean;
  domEl: HTMLLinkElement | HTMLScriptElement;
}

@Injectable()
export class ScriptsLoaderService {
  private loadedFiles: LoadFile[] = [];

  constructor(private eavService: EavService) { }

  /** Loads CSS and JS files in order (CSS first) and calls callback function when finished */
  load(scripts: string[], callback: () => any) {
    const sortedFiles = this.sortByType(scripts);
    this.insertToDom(sortedFiles, callback, 0); // async, called again and again after each script is loaded
  }

  private sortByType(scripts: string[]): LoadFile[] {
    const cssFiles: LoadFile[] = [];
    const jsFiles: LoadFile[] = [];
    scripts.forEach(script => {
      const file: LoadFile = {
        path: this.resolveSpecialPaths(script),
        type: null,
        loaded: false,
        domEl: null
      };
      if (file.path.endsWith(FileTypeConstants.CSS)) {
        file.type = FileTypeConstants.CSS;
        cssFiles.push(file);
      } else if (file.path.endsWith(FileTypeConstants.JS)) {
        file.type = FileTypeConstants.JS;
        jsFiles.push(file);
      }
    });
    return cssFiles.concat(jsFiles);
  }

  private insertToDom(files: LoadFile[], callback: () => any, increment: number) {
    const file = files[increment];
    increment++;
    if (!file) {
      callback();
      return;
    }
    file.path = file.path + '?sxcver=' + sxcVersion; // break cache

    const existing = this.loadedFiles.find(loadedFile => loadedFile.path === file.path);
    if (existing) {
      if (existing.loaded) {
        this.insertToDom(files, callback, increment);
      } else {
        const _listener = () => {
          file.loaded = true;
          this.insertToDom(files, callback, increment);
          existing.domEl.removeEventListener('load', _listener);
          existing.domEl.removeEventListener('error', _listener);
        };
        existing.domEl.addEventListener('load', _listener);
        existing.domEl.addEventListener('error', _listener);
      }
    } else {
      if (file.type === FileTypeConstants.CSS) {
        file.domEl = document.createElement('link');
        file.domEl.rel = 'stylesheet';
        file.domEl.href = file.path;
      } else if (file.type === FileTypeConstants.JS) {
        file.domEl = document.createElement('script');
        file.domEl.type = 'module';
        file.domEl.src = file.path;
      }

      const _listener = () => {
        file.loaded = true;
        this.insertToDom(files, callback, increment);
        file.domEl.removeEventListener('load', _listener);
        file.domEl.removeEventListener('error', _listener);
      };
      file.domEl.addEventListener('load', _listener);
      file.domEl.addEventListener('error', _listener);

      document.querySelector('head').appendChild(file.domEl);
      this.loadedFiles.push(file);
    }
  }

  private resolveSpecialPaths(url: string) {
    return url.replace(/\[System:Path\]/i, UrlHelpers.getUrlPrefix('system', this.eavService.eavConfig))
      .replace(/\[Zone:Path\]/i, UrlHelpers.getUrlPrefix('zone', this.eavService.eavConfig))
      .replace(/\[App:Path\]/i, UrlHelpers.getUrlPrefix('app', this.eavService.eavConfig));
  }
}
