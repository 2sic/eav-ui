import { Injectable } from '@angular/core';
import { classLog } from '../../../shared/logging';
import { EavWindow } from '../../../shared/models/eav-window.model';
import { FormConfigService } from '../../form/form-config.service';
import { FormConfiguration } from '../../form/form-configuration.model';
import { UrlHelpers } from '../helpers';

const logSpecs = {
  all: false,
  load: true,
  sortByType: false,
  insertToDom: false,
};

declare const window: EavWindow;

export const FileTypeConstants = {
  CSS: '.css',
  JS: '.js',
} as const;

interface LoadFile {
  path: string;
  type: string;
  loaded: boolean;
  domEl: HTMLLinkElement | HTMLScriptElement;
}

/**
 * Service for loading scripts and stylesheets dynamically for an edit form.
 * It must be different for each form, since it uses the form's configuration
 * to resolve paths pointing to the correct app, zone, etc.
 */
@Injectable()
export class ScriptsLoaderService {

  log = classLog({ScriptsLoaderService}, logSpecs);

  #loadedFiles: LoadFile[] = [];

  constructor(private formConfig: FormConfigService) { }

  /** Loads CSS and JS files in order (CSS first) and calls callback function when finished */
  load(scripts: string[], callback: () => void) {
    this.log.fnIf('load', {scripts})
    const sortedFiles = this.#sortByType(scripts);
    this.#insertToDom(sortedFiles, callback, 0); // async, called again and again after each script is loaded
  }

  #sortByType(scripts: string[]): LoadFile[] {
    this.log.fnIf('sortByType', {scripts})
    const cssFiles: LoadFile[] = [];
    const jsFiles: LoadFile[] = [];
    scripts.forEach(script => {
      const file: LoadFile = {
        path: ScriptsLoaderService.resolveUrlTokens(script, this.formConfig.config),
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

  #insertToDom(files: LoadFile[], callback: () => void, increment: number) {
    this.log.fnIf('insertToDom', {files, increment})
    const file = files[increment];
    increment++;
    if (!file) {
      callback();
      return;
    }
    file.path = file.path + '?sxcver=' + window.sxcVersion; // break cache

    const existing = this.#loadedFiles.find(loadedFile => loadedFile.path === file.path);
    if (existing) {
      if (existing.loaded) {
        this.#insertToDom(files, callback, increment);
      } else {
        const _listener = () => {
          file.loaded = true;
          this.#insertToDom(files, callback, increment);
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
        this.#insertToDom(files, callback, increment);
        file.domEl.removeEventListener('load', _listener);
        file.domEl.removeEventListener('error', _listener);
      };
      file.domEl.addEventListener('load', _listener);
      file.domEl.addEventListener('error', _listener);

      document.querySelector('head').appendChild(file.domEl);
      this.#loadedFiles.push(file);
    }
  }

  public static resolveUrlTokens(url: string, formConfig: FormConfiguration) {
    return url.replace(/\[System:Path\]/i, UrlHelpers.getUrlPrefix('system', formConfig))
      .replace(/\[Zone:Path\]/i, UrlHelpers.getUrlPrefix('zone', formConfig))
      .replace(/\[App:Path\]/i, UrlHelpers.getUrlPrefix('app', formConfig))
      .replace(/\[App:PathShared\]/i, UrlHelpers.getUrlPrefix('appShared', formConfig));
  }
}
