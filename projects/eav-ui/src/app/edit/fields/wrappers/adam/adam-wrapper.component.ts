import { Component, ElementRef, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { AdamHintComponent } from './adam-hint/adam-hint.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { AdamBrowserComponent } from './adam-browser/adam-browser.component';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
  selector: WrappersCatalog.AdamWrapper,
  templateUrl: './adam-wrapper.component.html',
  styleUrls: ['./adam-wrapper.component.scss'],
  standalone: true,
  imports: [
    AdamBrowserComponent,
    NgClass,
    ExtendedModule,
    AdamHintComponent,
  ],
})
export class AdamWrapperComponent implements OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;

  fullscreenAdam: boolean;
  adamDisabled = this.config.adam.isDisabled;

  ngOnInit() {
    this.fullscreenAdam = this.config.inputTypeSpecs.inputType === InputTypeCatalog.HyperlinkLibrary;
  }

  openUpload() {
    this.invisibleClickableRef.nativeElement.click();
  }
}
