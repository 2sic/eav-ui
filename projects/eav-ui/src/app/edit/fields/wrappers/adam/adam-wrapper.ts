import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';
import { AdamBrowserComponent } from './adam-browser/adam-browser';
import { AdamHintComponent } from './adam-hint/adam-hint';

@Component({
    selector: WrappersCatalog.AdamWrapper,
    templateUrl: './adam-wrapper.html',
    styleUrls: ['./adam-wrapper.scss'],
    imports: [
        AdamBrowserComponent,
        NgClass,
        AdamHintComponent,
    ]
})
export class AdamWrapperComponent implements OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;

  constructor() { }

  fullscreenAdam: boolean;
  adamDisabled = this.config.adam.isDisabled;


  ngOnInit() {
    this.fullscreenAdam = this.config.inputTypeSpecs.inputType === InputTypeCatalog.HyperlinkLibrary;
  }

  openUpload() {
    this.invisibleClickableRef.nativeElement.click();
  }
}
