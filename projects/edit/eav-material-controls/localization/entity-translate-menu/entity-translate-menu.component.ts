import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLink, TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { EntityTranslateMenuTemplateVars } from './entity-translate-menu.models';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTranslateMenuComponent implements OnInit {
  @Input() private config: FieldConfigSet;
  @Input() private group: FormGroup;

  translationLinkConstants = TranslationLinkConstants;
  templateVars$: Observable<EntityTranslateMenuTemplateVars>;

  constructor(private languageInstanceService: LanguageInstanceService, private itemService: ItemService) { }

  ngOnInit() {
    const slotIsEmpty$ = this.itemService.selectItemHeader(this.config.entity.entityGuid).pipe(
      map(header => !header?.Group?.SlotCanBeEmpty ? false : header.Group.SlotIsEmpty),
    );
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.templateVars$ = combineLatest([slotIsEmpty$, currentLanguage$, defaultLanguage$]).pipe(
      map(([slotIsEmpty, currentLanguage, defaultLanguage]) => ({ slotIsEmpty, currentLanguage, defaultLanguage })),
    );
  }

  translateMany(translationLink: TranslationLink) {
    this.languageInstanceService.translateMany({
      formId: this.config.form.formId,
      entityGuid: this.config.entity.entityGuid,
      translationLink,
    });
  }
}
