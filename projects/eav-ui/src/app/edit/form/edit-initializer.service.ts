import { Inject, Injectable, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { transient } from '../../../../../core';
import { FeaturesService } from '../../features/features.service';
import { Update$2sxcEnvFromContext } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { convertUrlToForm } from '../../shared/helpers/url-prep.helper';
import { classLog } from '../../shared/logging';
import { ItemAddIdentifier } from '../../shared/models/edit-form.model';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { DialogRoutingState } from '../dialog/dialogRouteState.model';
import { calculateIsParentDialog, sortLanguages } from '../dialog/main/edit-dialog-main.helpers';
import { EavEditLoadDto, EditSettings } from '../dialog/main/edit-dialog-main.models';
import { LanguageService } from '../localization/language.service';
import { EditUrlParams } from '../routing/edit-url-params.model';
import { AdamCacheService } from '../shared/adam/adam-cache.service';
import { LinkCacheService } from '../shared/adam/link-cache.service';
import { ContentTypeItemService } from '../shared/content-types/content-type-item.service';
import { ContentTypeService } from '../shared/content-types/content-type.service';
import { InputTypeService } from '../shared/input-types/input-type.service';
import { EavContentType } from '../shared/models/eav/eav-content-type';
import { EavEntity } from '../shared/models/eav/eav-entity';
import { ItemService } from '../state/item.service';
import { correctAdamFolderBasePath, extractAdamPortalUrl } from './correctAdamUrl';
import { FormConfigService } from './form-config.service';
import { FormDataService } from './form-data.service';
import { FormLanguageService } from './form-language.service';
import { FormPublishingService } from './form-publishing.service';
import { InitialValuesService } from './initial-values-service';
import { InitializeMissingValuesServices } from './initialize-missing-values-services';
import { ItemsRequestRestoreHelper } from './items-request-restore-helper';

const logSpecs = {
  all: false,
  constructor: false,
  fetchFormData: false,
  dataFromDialog: false,
  importLoadedData: false,
  initMissingValues: false,
};

/**
 * Service to initialize an edit form. Will:
 * - Load form data
 * - store it in various services, stores etc.
 * - Load initial values for formulas
 */
@Injectable()
export class EditInitializerService {

  log = classLog({ EditInitializerService }, logSpecs);

  public loaded = signal(false);

  #formDataService = transient(FormDataService);

  #userLanguageSvc = transient(UserLanguageService);
  #initMissingValuesSvc = transient(InitializeMissingValuesServices);

  adamPortalUrl = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private publishStatusService: FormPublishingService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private languageStore: FormLanguageService,
    private snackBar: MatSnackBar,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private featuresService: FeaturesService,
    private initialValuesService: InitialValuesService,
    @Inject(MAT_DIALOG_DATA) private dialogData: DialogRoutingState,
  ) {
    this.log.aIf('constructor', null, "constructor");

  }

  /**
   * Fetch the form data from the backend and load it into the various services.
   * This will also set the form config and language.
   */
  fetchFormData(): void {
    const l = this.log.fnIf('fetchFormData');
    const d = this.log.fnIf('dataFromDialog');

    const itemsRaw = (this.route.snapshot.params as EditUrlParams).items;

    d.a('state Data from Dialog', { stateData: this.dialogData });

    const items = convertUrlToForm(itemsRaw).items;

    // Reduce amount of data sent to backend by removing unneeded properties
    const dataHelper = new ItemsRequestRestoreHelper(items, this.dialogData?.overrideContents);

    const requestItems = dataHelper.itemsForRequest();

    l.a('fetchFormData', { requestItems });

    this.#formDataService
      .fetchFormData(JSON.stringify(requestItems))
      .subscribe((responseRaw: EavEditLoadDto) => {

        // Set Adam Portal URL to check with the WYSIWYG editor 
        const fullUrl = Object.values(responseRaw?.Prefetch?.Links)[0].Value;
        this.adamPortalUrl.set(extractAdamPortalUrl(fullUrl));

        // Restore prefill and client-data from original
        const response: EavEditLoadDto = {
          ...responseRaw,
          Items: dataHelper.mergeResponse(responseRaw.Items),
        };

        l.a('fetchFormData - after remix', { response });

        // Load all the feature infos and also mark the ones which the response says are required
        this.featuresService.load(response.Context, response);

        // Transfer any relevant context data to the $2sxc env for future backend calls
        Update$2sxcEnvFromContext(response.Context.App);


        // Import the loaded data into the various services
        this.#importLoadedData(response);

        // Remember initial values as the formulas sometimes need them
        this.initialValuesService.preserve();

        // After preserving original values, initialize missing values in the form
        this.#initMissingValues();

        // Set the form as loaded to trigger the UI to be built
        this.loaded.set(true);
      });
  }

  /**
   * Import the loaded data into the various services and stores.
   * This will also set the form config and language.
   * @param loadDto The loaded data from the backend
   */
  #importLoadedData(loadDto: EavEditLoadDto): void {
    const l = this.log.fnIf('importLoadedData');

    const formId = Math.floor(Math.random() * 99999);
    const isParentDialog = calculateIsParentDialog(this.route);

    // Check the Adam Portal URL and adjust the items if necessary (Export App / Import App)
    if (this.adamPortalUrl()) {
      loadDto.Items = correctAdamFolderBasePath(loadDto.Items, this.adamPortalUrl());
      l.a('importLoadedData - checkAdamFolder', { items: loadDto.Items });
    }

    // Load data into the ItemsService; will convert the data to the correct type
    this.itemService.loadItems(loadDto.Items);

    // Load InputTypes, ContentTypes and any items which the ContentTypes depend on
    // Note: we assume that input type and content type data won't change between loading parent and child forms
    this.inputTypeService.addMany(loadDto.InputTypes);
    this.contentTypeItemService.addContentTypeItems(loadDto.ContentTypeItems);
    this.contentTypeService.addContentTypes(loadDto.ContentTypes);

    // Load prefetched data for Adam and Links
    this.adamCacheService.loadPrefetch(loadDto.Prefetch?.Adam);
    this.linkCacheService.addPrefetch(loadDto.Prefetch?.Links, loadDto.Prefetch?.Adam);

    // Get the (converted) items and set the form config
    const itemGuids = loadDto.Items.map(item => item.Entity.Guid);
    const items = this.itemService.getMany(itemGuids);

    // Determine what edit-mode we are in, if we are copying an item, if we should enable history etc.
    const createMode = items[0].Entity.Id === 0;
    const isCopy = (items[0].Header as ItemAddIdentifier).DuplicateEntity != null;
    const enableHistory = !createMode && this.route.snapshot.data.history !== false;

    // Load the form config with the loaded settings
    const settingsAsEav: EditSettings = {
      ...loadDto.Settings,
      // Include / pre-convert settings entities for certain features which need detailed settings
      Entities: EavEntity.dtoToEavMany(loadDto.Settings.Entities),
      // Include / pre-convert content types for certain features which need detailed settings
      ContentTypes: EavContentType.dtoToEavMany(loadDto.Settings.ContentTypes),
    };
    this.formConfig.initFormConfig(loadDto.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory, settingsAsEav);

    // Determine languages we should use and inform the language service about them
    // also switch the UI / translate service to the current language
    // Note: the TranslateService is a new instance for every form and language must be set for every one of them
    var langs = loadDto.Context.Language;
    const userLangCode = this.#userLanguageSvc.uiCode(langs.Current);
    this.translate.use(userLangCode);

    // load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const sortedLanguages = sortLanguages(langs.Primary, langs.List);
      this.languageService.addMany(sortedLanguages);
    }
    this.languageStore.addForm(formId, langs.Primary, langs.Current, false);

    // Get proper publishMode and then run checks if this mode is allowed
    const publishMode = this.publishStatusService.toPublishMode(loadDto);
    this.publishStatusService.setPublishMode(publishMode, formId, this.formConfig);
  }

  /**
   * Initialize missing values in the form.
   * If necessary, also switch the UI to the default language.
   */
  #initMissingValues(): void {
    const l = this.log.fnIf('initMissingValues');

    const switchToDefault = this.#initMissingValuesSvc.initMissingValues();
    const language = this.formConfig.language();

    if (switchToDefault && language.current !== language.primary) {
      const formId = this.formConfig.config.formId;
      this.languageStore.setCurrent(formId, language.primary);
      const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: language.primary });
      this.snackBar.open(message, null, { duration: 5000 });
    }
  }
}
