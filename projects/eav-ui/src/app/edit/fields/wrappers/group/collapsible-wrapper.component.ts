import { NgClass } from '@angular/common';
import { Component, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EmptyDefault } from 'projects/edit-types/src/FieldSettings-EmptyDefault';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../../../shared/logging';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { FieldsSettingsService } from '../../../state/fields-settings.service';
import { ChangeAnchorTargetDirective } from '../../directives/change-anchor-target.directive';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';


@Component({
  selector: WrappersCatalog.CollapsibleWrapper,
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    NgClass,
    MatIconModule,
    ChangeAnchorTargetDirective,
    SafeHtmlPipe,
  ],
})
export class CollapsibleWrapperComponent {

  log = classLog({CollapsibleWrapperComponent});

  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  #fieldState = inject(FieldState);
  protected config = this.#fieldState.config;
  protected group = this.#fieldState.group;
  protected basics = this.#fieldState.basics;

  /** Collapsed state - will be updated in various scenarios */
  collapsed= this.#fieldState.settingExt('Collapsed');

  #fieldsSettingsSvc = inject(FieldsSettingsService);

  constructor() {
    EmptyDefaultLogic.importMe();
  }

  toggleCollapse(): void {
    const before = this.collapsed();
    this.log.a('toggleCollapse', { before })
    this.#fieldsSettingsSvc.updateSetting<FieldSettings & EmptyDefault>(this.#fieldState.name, { Collapsed: !before }, "CollapsibleWrapperComponent");
  }
}
