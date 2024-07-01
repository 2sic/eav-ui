import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { DialogContext } from '../../../app-administration/models';
import { keyPartOfPage, keyPublishing, partOfPageDefault } from '../../../shared/constants/session.constants';
import { Context } from '../../../shared/services/context';
import { EditSettings } from '../../dialog/main/edit-dialog-main.models';
import { FormConfiguration, VersioningOptions } from '../models';
import { FormLanguage, FormLanguagesConfig } from '../models/form-languages.model';
import { Observable } from 'rxjs';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'FormConfigService';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class FormConfigService {
  /** no constructor */
  constructor() {}

  log = new EavLogger(nameOfThis, logThis);

  /**
   * Important! These are constants that form was loaded with.
   * They are initialized in the main edit-form.
   * They do not change while form is running
   */
  config: FormConfiguration;

  // WIP, null at first
  configSignal = signal<FormConfiguration>(null);

  /**
   * Current form language information
   */
  language: Signal<FormLanguage>;

  /**
   * Current edit settings
   * Note: Clean use - only used by classes that inject this themselves
   */
  settings: EditSettings;

  /**
   * Form language configuration, not meant to change during runtime...
   */
  languages: FormLanguagesConfig;

  /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
  private context = inject(Context);
  private languageService = inject(LanguageInstanceService);

  /** Create EavConfiguration from sessionStorage */
  initFormConfig(
    dialogContext: DialogContext,
    formId: number,
    isParentDialog: boolean,
    itemGuids: string[],
    createMode: boolean,
    isCopy: boolean,
    enableHistory: boolean,
    settings: EditSettings
  ) {
    this.settings = settings;
    this.languages = {
      initial: dialogContext.Language.Current,
      primary: dialogContext.Language.Primary,
      list: dialogContext.Language.List,
    };
    this.config = {
      zoneId: this.context.zoneId.toString(),
      appId: this.context.appId.toString(),
      appRoot: dialogContext.App.Url,
      appSharedRoot: dialogContext.App.SharedUrl,
      moduleId: this.context.moduleId?.toString(),
      partOfPage: sessionStorage.getItem(keyPartOfPage) ?? partOfPageDefault,
      portalRoot: dialogContext.Site.Url,
      tabId: this.context.tabId?.toString(),
      systemRoot: window.location.pathname.split('/dist/')[0] + '/',
      versioningOptions: this.getVersioningOptions(
        sessionStorage.getItem(keyPartOfPage) === 'true',
        sessionStorage.getItem(keyPublishing)
      ),
      formId,
      isParentDialog,
      itemGuids,
      createMode,
      isCopy,
      enableHistory,
      enableFormulaSave: dialogContext.Enable.FormulaSave ?? false,
      overrideEditRestrictions: dialogContext.Enable.OverrideEditRestrictions ?? false,
      dialogContext,
      settings,
    };
    this.configSignal.set(this.config);
    this.language = this.languageService.getLanguageSignal(formId);
  }

  private getVersioningOptions(
    partOfPage: boolean,
    publishing: string
  ): VersioningOptions {

    const allowAll: VersioningOptions = { show: true, hide: true, branch: true };
    
    if (!partOfPage)
      return allowAll;

    const publish = publishing || '';
    switch (publish) {
      case '':
      case 'DraftOptional':
        return allowAll;
      case 'DraftRequired':
        // Note: the key 'show' should not be added, as the code later picks the first property to set the default
        // Branch should also be first, as it's the preferred option
        return { branch: true, hide: true };
      case 'DraftForbidden':
        return { show: true };
      default: {
        console.error(`Invalid versioning requirements: ${publish}`);
        return {};
      }
    }
  }

  /**
   * Get the language observable for the form - it will keep track of the current language as it changes.
   */
  get language$(): Observable<FormLanguage> {
    return this._language$ ??= this.languageService.getLanguage$(this.config.formId);
  }
  private _language$: Observable<FormLanguage>;


}
