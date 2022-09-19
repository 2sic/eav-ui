import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { EavService, FieldsTranslateService, FormsStateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { EntityTranslateMenuTemplateVars } from './entity-translate-menu.models';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
})
export class EntityTranslateMenuComponent implements OnInit {
  @Input() entityGuid: string;

  templateVars$: Observable<EntityTranslateMenuTemplateVars>;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsTranslateService: FieldsTranslateService,
    private formsStateService: FormsStateService,
  ) { }

  ngOnInit() {
    const readOnly$ = this.formsStateService.readOnly$;
    const slotIsEmpty$ = this.itemService.getItemHeader$(this.entityGuid).pipe(
      // 2022-09-19 2dm #cleanUpDuplicateGroupHeaders - change to header.IsEmptyAllowed etc.
      map(header => !header.IsEmptyAllowed /* .Group?.SlotCanBeEmpty */ ? false : header.IsEmpty /* .Group.SlotIsEmpty */),
    );
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    this.templateVars$ = combineLatest([readOnly$, slotIsEmpty$, currentLanguage$, defaultLanguage$]).pipe(
      map(([readOnly, slotIsEmpty, currentLanguage, defaultLanguage]) => {
        const templateVars: EntityTranslateMenuTemplateVars = {
          readOnly: readOnly.isReadOnly,
          slotIsEmpty,
          currentLanguage,
          defaultLanguage,
        };
        return templateVars;
      }),
    );
  }

  translateMany() {
    this.fieldsTranslateService.translateMany();
  }

  dontTranslateMany() {
    this.fieldsTranslateService.dontTranslateMany();
  }
}
