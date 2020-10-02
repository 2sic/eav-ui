import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FieldConfigGroup, FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ContentType, EavHeader } from '../../../shared/models/eav';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { ValidationHelper } from '../../validators/validation-helper';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  fieldConfig: FieldConfigGroup;
  visibleInEditUI$: Observable<boolean>;
  collapse$ = new BehaviorSubject(false);
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  itemTitle$: Observable<string>;
  slotCanBeEmpty$: Observable<boolean>;
  slotIsEmpty$: Observable<boolean>;
  description$: Observable<string>;

  private header$: Observable<EavHeader>;
  private subscription = new Subscription();

  constructor(
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.visibleInEditUI$ = this.fieldConfig.settings$.pipe(map(settings => (settings.VisibleInEditUI === false) ? false : true));
    this.header$ = this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid);

    this.collapse$.next(this.fieldConfig.settings$.value.DefaultCollapsed || false);
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.slotCanBeEmpty$ = this.header$.pipe(map(header => header?.Group?.SlotCanBeEmpty || false));
    this.slotIsEmpty$ = this.header$.pipe(map(header => header?.Group?.SlotIsEmpty || false));

    this.itemTitle$ = !this.fieldConfig.isParentGroup
      ? this.fieldConfig.settings$.pipe(map(settings => settings.Name))
      : this.currentLanguage$.pipe(map(currentLanguage => {
        let contentType: ContentType;
        this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId).pipe(take(1)).subscribe(cType => {
          contentType = cType;
        });
        let defaultLanguage: string;
        this.defaultLanguage$.pipe(take(1)).subscribe(defaultLang => {
          defaultLanguage = defaultLang;
        });
        let label: string;
        try {
          const type = contentType.contentType.metadata
            // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
            .find(metadata => metadata.type.name === 'ContentType' || metadata.type.name === 'xx ContentType');
          if (!!type) {
            label = LocalizationHelper.getValueOrDefault(type.attributes.Label, currentLanguage, defaultLanguage)?.value;
          }
          label = label || contentType.contentType.name;
        } catch (error) {
          label = contentType.contentType.name;
        }
        return label;
      }));

    this.description$ = this.fieldConfig.settings$.pipe(map(settings => {
      if (this.fieldConfig.isParentGroup) {
        return settings.EditInstructions != null ? settings.EditInstructions : '';
      }
      return settings.Notes != null ? settings.Notes : '';
    }));

    this.subscription.add(
      this.currentLanguage$.subscribe(currentLanguage => {
        let defaultLanguage: string;
        this.defaultLanguage$.pipe(take(1)).subscribe(defaultLang => {
          defaultLanguage = defaultLang;
        });
        this.translateAllConfiguration(currentLanguage, defaultLanguage);
      })
    );
  }

  ngOnDestroy() {
    this.collapse$.complete();
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.collapse$.next(!this.collapse$.value);
  }

  toggleSlotIsEmpty() {
    let header: EavHeader;
    this.header$.pipe(take(1)).subscribe(hdr => {
      header = hdr;
    });
    const newHeader: EavHeader = { ...header, Group: { ...header.Group, SlotIsEmpty: !header.Group.SlotIsEmpty } };
    this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid, newHeader);
  }

  openHistory() {
    this.router.navigate([`versions/${this.config.entity.entityId}`], { relativeTo: this.route });
  }

  private translateAllConfiguration(currentLanguage: string, defaultLanguage: string) {
    const fieldSettings = LocalizationHelper.translateSettings(this.fieldConfig.fullSettings, currentLanguage, defaultLanguage);
    this.fieldConfig.settings = fieldSettings;
    this.fieldConfig.label = this.fieldConfig.settings.Name || null;
    this.fieldConfig.validation = ValidationHelper.getValidations(this.fieldConfig.settings);
    this.fieldConfig.required = ValidationHelper.isRequired(this.fieldConfig.settings);
    this.config.field.settings$?.next(fieldSettings); // must run after validations are recalculated
  }
}
