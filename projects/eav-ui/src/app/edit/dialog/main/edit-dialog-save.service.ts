import { computed, inject, Injectable, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { classLog } from '../../../shared/logging';
import { EntityFormBuilderComponent } from '../../entity-form/entity-form-builder/form-builder';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { FormConfigService } from '../../form/form-config.service';
import { FormDataService } from '../../form/form-data.service';
import { FormPublishingService } from '../../form/form-publishing.service';
import { FormsStateService } from '../../form/forms-state.service';
import { ContentTypeService } from '../../shared/content-types/content-type.service';
import { EavItem } from '../../shared/models/eav/eav-item';
import { EavEntityBundleDto } from '../../shared/models/json-format-v1/eav-entity-bundle-dto';
import { ValidationMsgHelper } from '../../shared/validation/validation-messages.helpers';
import { ItemService } from '../../state/item.service';
import { MetadataDecorators } from '../../state/metadata-decorators.constants';
import { SaveJsReturnData } from '../dialogRouteState.model';
import { EditDialogMainComponent } from './edit-dialog-main';
import { SaveEavFormData } from './edit-dialog-main.models';
import { SnackBarSaveErrorsComponent } from './snack-bar-save-errors/snack-bar-save-errors';
import { FieldErrorMessage, SaveErrorsSnackBarData } from './snack-bar-save-errors/snack-bar-save-errors.models';

const logSpecs = {
  'saveAll': true,
  '#saveThroughJs': true,
  '#saveDefault': true,
}

/**
 * Helper to perform saving operations in the Edit Dialog
 */
@Injectable()
export class EditDialogSaveService {

  log = classLog({ EditDialogSaveService }, logSpecs);
  
  #formConfig = inject(FormConfigService);
  itemService = inject(ItemService);
  contentTypeService = inject(ContentTypeService);
  formsStateService = inject(FormsStateService);
  publishStatusService = inject(FormPublishingService);
  translate = inject(TranslateService);
  snackBar = inject(MatSnackBar);

  #formDataService = transient(FormDataService);

  /**
   * Bug: 2026-01-08 this is injected as transient, so it's its own instance.
   * But it's also used in one other place (the popup-dialog)
   * where it checks for isSaving - but that will never match with this one.
   * Won't fix yet, because the side-effect must be minimal, but it's not quite right.
   */
  entityFormStateService = transient(EntityFormStateService);

  /** Determine that save is not allowed / enabled at certain times */
  disabled = computed(() => this.entityFormStateService.isSaving() || this.formsStateService.saveButtonDisabled());


  /** 
   * Save Everything - if possible, and optionally close the dialog
   */
  saveAll(editDialog: EditDialogMainComponent, close: boolean): void {

    const l = this.log.fnIf('saveAll', { close });

    this.entityFormStateService.isSaving.set(true);


    // Case 0. Form not valid
    if (!this.formsStateService.formsAreValid()) {
      this.#skipSaveWhenFormIsInvalid(editDialog);
      return l.end('save skipped - form invalid');
    }

    // Case 1.1. New v20 - if no save mode, then just close the dialog
    if (this.#formConfig.config.save.mode === false) {
      editDialog.dialog.close();
      return l.end('no-save mode; closed without saving');
    }

    // Case 1.2. If the Dialog is Local return data mode, then return the data

    const eavItem = this.itemService.get(editDialog.formBuilderRefs.get(0).entityGuid());
    const saveMode = eavItem.Header.ClientData?.save === 'js';

    if (saveMode) {
      this.#saveThroughJs(editDialog, close);
      return l.end('will be saved through js');
    }

    // Case 1.3. If the Dialog is in standard Save Mode, then just save the data
    this.#saveDefault(editDialog, close);
    return l.end('saved default');

  }

  /**
   * Skip saving, but instead return the data so upstream can handle saving
   * @returns 
   */
  #saveThroughJs(editDialog: EditDialogMainComponent, close: boolean): void {
    const l = this.log.fnIf('#saveThroughJs', { close });
    const itemsEavObj: Record<string, unknown>[] = this.#getValidEavItems(editDialog.formBuilderRefs,
      eavItem => EavItem.eavToObj(eavItem),
    );

    // Need to be clearly define for the route state (if objData in the state, data will be not refresh from the server) 
    const wrappedData: SaveJsReturnData<unknown> = {
      objData: itemsEavObj[0]
    };
    editDialog.dialog.close(wrappedData);
    return l.end('returning wrapped data');
  }

  /**
   * Do standard save operation
   * @param editDialog 
   * @param close 
   */
  #saveDefault(editDialog: EditDialogMainComponent, close: boolean): void {
    const l = this.log.fnIf('#saveDefault', { close });

    // Convert data to save format, get publishing state and prepare save data
    const items = this.#getValidEavItems(
      editDialog.formBuilderRefs,
      eavItem => EavEntityBundleDto.bundleToDto(eavItem)
    );

    const publishStatus = this.publishStatusService.get(this.#formConfig.config.formId);

    const saveFormData: SaveEavFormData = {
      Items: items,
      IsPublished: publishStatus.IsPublished,
      DraftShouldBranch: publishStatus.DraftShouldBranch,
    };
    l.a('SAVE FORM DATA:', { saveFormData });

    // Show saving message and start saving process
    this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

    this.#formDataService
      .saveFormData(saveFormData, this.#formConfig.config.partOfPage)
      .subscribe({
        next: result => {
          l.a('SAVED!, result:', { result, close });
          this.itemService.updater.updateItemId(result);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.formsStateService.formsAreDirty.set(false);
          if (close)
            editDialog.closeDialog(undefined, result);

          setTimeout(() => this.entityFormStateService.isSaving.set(false), 500);
        },
        error: err => {
          l.a('SAVE FAILED:', err);
          this.snackBar.open('Error', null, { duration: 2000 });
          this.entityFormStateService.isSaving.set(false)
        },
      });
  }


  /**
   * Handle skipping save when the form is invalid.
   */
  #skipSaveWhenFormIsInvalid(editDialog: EditDialogMainComponent): void {
    // Quickly set saving to false, otherwise further saves will be blocked
    this.entityFormStateService.isSaving.set(false);

    // check if there is even a formBuilder to process, otherwise exit
    if (editDialog.formBuilderRefs == null)
      return;

    const formErrors: Record<string, string>[] = [];
    editDialog.formBuilderRefs.forEach(formBuilderRef => {
      if (!formBuilderRef.form.invalid)
        return;
      formErrors.push(ValidationMsgHelper.validateForm(formBuilderRef.form));
    });

    const fieldErrors: FieldErrorMessage[] = [];
    formErrors.forEach(formError => {
      Object.keys(formError).forEach(key => {
        fieldErrors.push({ field: key, message: formError[key] });
      });
    });

    this.snackBar.openFromComponent(SnackBarSaveErrorsComponent, {
      data: {
        fieldErrors,
      } satisfies SaveErrorsSnackBarData,
      duration: 5000,
    });
  }

  /**
   * Get valid EAV items by mapping them with the provided function.
   * @param mapFn Function to map EavItem to a specific type T or null if invalid
   * @returns Array of valid mapped items
   */
  #getValidEavItems<T>(formBuilderRefs: QueryList<EntityFormBuilderComponent>, mapFn: (eavItem: EavItem) => T | null): T[] {
    return formBuilderRefs
      .map(ref => {
        const eavItem = this.itemService.get(ref.entityGuid());

        const isValid = this.formsStateService.getFormValid(eavItem.Entity.Guid);
        if (!isValid)
          return null;

        const hasAttributes = Object.keys(eavItem.Entity.Attributes).length > 0;
        const contentType = this.contentTypeService.getContentTypeOfItem(eavItem);
        const saveIfEmpty = contentType.Metadata.some(
          m => m.Type.Name === MetadataDecorators.SaveEmptyDecorator
        );

        if (!hasAttributes && !saveIfEmpty)
          return null;

        return mapFn(eavItem);
      })
      .filter((item): item is T => item != null);
  }

}