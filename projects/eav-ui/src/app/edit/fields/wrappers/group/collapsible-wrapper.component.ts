import { Component, ViewChild, ViewContainerRef, computed, inject } from '@angular/core';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';
import { ChangeAnchorTargetDirective } from '../../directives/change-anchor-target.directive';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FieldState } from '../../field-state';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FieldsSettingsService } from '../../../state/fields-settings.service';
import { WrappersCatalog } from '../wrappers.constants';

const logSpecs = {
  enabled: false,
  name: 'CollapsibleWrapperComponent',
};

@Component({
  selector: WrappersCatalog.CollapsibleWrapper,
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    NgClass,
    ExtendedModule,
    FlexModule,
    MatIconModule,
    ChangeAnchorTargetDirective,
    AsyncPipe,
    SafeHtmlPipe,
  ],
})
export class CollapsibleWrapperComponent {

  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  private fieldState = inject(FieldState);
  protected config = this.fieldState.config;
  protected group = this.fieldState.group;
  protected basics = this.fieldState.basics;

  /** Collapsed state - will be updated in various scenarios */
  collapsed = computed(() => this.fieldState.settings().Collapsed);

  private fieldsSettingsService = inject(FieldsSettingsService);

  log = new EavLogger(logSpecs);
  constructor() {
    EmptyDefaultLogic.importMe();
  }

  toggleCollapse(): void {
    const before = this.collapsed();
    this.log.a('toggleCollapse', { before })
    this.fieldsSettingsService.updateSetting(this.fieldState.name, { Collapsed: !before }, logSpecs.name);
  }
}
