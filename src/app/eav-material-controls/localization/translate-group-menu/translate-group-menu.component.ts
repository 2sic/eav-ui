import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LanguageService } from '../../../shared/services/language.service';
import { ItemService } from '../../../shared/services/item.service';
import { EavValue, EavAttributes, EavValues } from '../../../shared/models/eav';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../validators/validation-helper';


@Component({
  selector: 'app-translate-group-menu',
  templateUrl: './translate-group-menu.component.html',
  styleUrls: ['./translate-group-menu.component.scss']
})
export class TranslateGroupMenuComponent implements OnInit {

  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  headerGroupSlotIsEmpty = false;

  private subscriptions: Subscription[] = [];

  constructor(private dialog: MatDialog,
    private languageService: LanguageService,
    private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  ngOnInit() {

    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entityId, this.config.entityGuid);
    console.log('config', this.config);
    this.subscribeToAttributeValues();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.subscribeToEntityHeaderFromStore();
  }

  translateAll() {
    console.log('translateAll');
    Object.keys(this.attributes).forEach(attributeKey => {

      this.translateUnlink(attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }


  translateUnlink(attributeKey: string) {
    console.log('translateAll removeItemAttributeDimension attributes', this.attributes[attributeKey]);
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);
    console.log('translateAll removeItemAttributeDimension', attributeKey);
    console.log('translateAll removeItemAttributeDimension attributes', this.attributes[attributeKey]);
    console.log('translateAll removeItemAttributeDimension defaultLanguage', this.defaultLanguage);
    const defaultValue: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributes[attributeKey],
      this.defaultLanguage,
      this.defaultLanguage
    );
    console.log('translateAll defaultValue', defaultValue);
    if (defaultValue) {
      console.log('translateAll addAttributeValue', attributeKey);
      this.itemService.addAttributeValue(this.config.entityId, attributeKey, defaultValue.value,
        this.currentLanguage, false, this.config.entityGuid, this.config.type);
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + this.defaultLanguage + ' because that value does not exist.');
    }

    this.refreshControlConfig(attributeKey);
  }

  private refreshControlConfig(attributeKey: string) {
    // TODOD preskocio parent group
    if (!this.config.isParentGroup) {
      this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
      // this.setAdamDisable();
      // this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
    }
  }

  /**
 * Determine is control disabled or enabled
 * @param attributes
 * @param attributeKey
 * @param currentLanguage
 * @param defaultLanguage
 */
  private setControlDisable(attributes: EavValues<any>, attributeKey: string, currentLanguage: string,
    defaultLanguage: string) {
    // if control already disabled through settings then skip
    if (!this.config.disabled) {
      // if header group slot is empty disable control
      if (this.headerGroupSlotIsEmpty) {
        this.group.controls[attributeKey].disable({ emitEvent: false });
      } else { // else set enable/disable depending on editable translation exist
        if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
          this.group.controls[attributeKey].enable({ emitEvent: false });
        } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
          this.group.controls[attributeKey].disable({ emitEvent: false });
        } else {
          this.group.controls[attributeKey].disable({ emitEvent: false });
        }
      }
    }
  }

  private translateAllConfiguration(currentLanguage: string) {
    this.config.settings = LocalizationHelper.translateSettings(this.config.fullSettings, this.currentLanguage, this.defaultLanguage);
    this.config.label = this.config.settings.Name ? this.config.settings.Name : null;
    // important - a hidden field don't have validations and is not required
    const visibleInEditUI = (this.config.settings.VisibleInEditUI === false) ? false : true;
    this.config.validation = visibleInEditUI
      ? ValidationHelper.setDefaultValidations(this.config.settings)
      : [];
    this.config.required = this.config.settings.Required && visibleInEditUI
      ? this.config.settings.Required
      : false;
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
        this.translateAllConfiguration(this.currentLanguage);
        this.refreshControlConfig(this.config.name);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscriptions.push(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        console.log('[create] read default language', defaultLanguage);
        this.defaultLanguage = defaultLanguage;

        this.translateAllConfiguration(this.currentLanguage);
        if (!this.config.isParentGroup) {
          this.setControlDisable(this.attributes[this.config.name], this.config.name, this.currentLanguage, this.defaultLanguage);
          // this.setAdamDisable();
          // this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
        }
      })
    );
  }

  /**
 * Subscribe to item attribute values
 */
  private subscribeToAttributeValues() {
    this.subscriptions.push(
      this.attributes$.subscribe(attributes => {
        this.attributes = attributes;
      })
    );
  }

  private subscribeToEntityHeaderFromStore() {
    if (this.config.header.group && this.config.header.group.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entityId, this.config.entityGuid).subscribe(header => {
          if (header.group) {
            this.headerGroupSlotIsEmpty = header.group.slotIsEmpty;
            this.setControlDisable(this.attributes[this.config.name], this.config.name, this.currentLanguage, this.defaultLanguage);
          }
        })
      );
    }
  }

  dontTranslateAll() {
    console.log('dontTranslateAll');
  }

  openLinkToOtherLanguage() {
    // Open dialog
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
      autoFocus: false,
      width: '280px',
      // height: '80vh',
      // position: <DialogPosition>{ top: '10px', bottom: '10px' , left: '24px', right: '24px'},
      data: new LinkToOtherLanguageData('translate', 'en-us')
    });

    // dialogRef.componentInstance.publishMode = this.multiFormDialogRef.componentInstance.publishMode;
    // Close dialog
    dialogRef.afterClosed().subscribe(result => {
      // this.multiFormDialogRef.componentInstance.publishMode = dialogRef.componentInstance.publishMode;
      console.log('dialog closed');
    });
  }


}
