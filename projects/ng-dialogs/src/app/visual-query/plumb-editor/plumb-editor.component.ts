import { Component, OnInit, Input, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

import { QueryDefinitionService } from '../services/query-definition.service';
import { PlumbGuiService, dataSrcIdPrefix } from '../services/plumb-gui.service';
import { QueryDef } from '../models/query-def.model';
import { PipelineDataSource } from '../models/pipeline.model';
import { PlumbType } from '../models/plumb.model';
declare const jsPlumb: PlumbType;

@Component({
  selector: 'app-plumb-editor',
  templateUrl: './plumb-editor.component.html',
  styles: [':host {display: block; width: 100%; height: 100%}'],
  styleUrls: ['./plumb-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlumbEditorComponent implements OnInit, AfterViewInit {
  @Input() queryDef: QueryDef;
  @Output() save = new EventEmitter<null>();
  @Output() editDataSourcePart = new EventEmitter<PipelineDataSource>();
  @Output() instanceChanged = new EventEmitter<PlumbType>();
  @ViewChildren('dataSourceElement') dataSourceElements: QueryList<ElementRef<HTMLDivElement>>;

  instance: PlumbType;

  constructor(private queryDefinitionService: QueryDefinitionService, private plumbGuiService: PlumbGuiService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // executed first because <app-plumb-editor> has *ngIf on it and *ngFor for dataSourceElements won't have changes at first init
    jsPlumb.ready(() => { this.jsPlumbReady(); });

    // https://stackoverflow.com/questions/37087864/execute-a-function-when-ngfor-finished-in-angular-2/37088348#37088348
    // executed when queryDef changes value
    this.dataSourceElements.changes.subscribe((elements: QueryList<ElementRef<HTMLDivElement>>) => {
      this.instance.reset();
      this.plumbGuiService.connectionsInitialized = false;
      jsPlumb.ready(() => { this.jsPlumbReady(); });
    });
  }

  private jsPlumbReady() {
    this.instance = this.plumbGuiService.buildInstance(this.queryDef);
    this.instanceChanged.emit(this.instance);
    if (this.plumbGuiService.connectionsInitialized) { return; }
    this.dataSourceElements.forEach(dsEl => {
      const dataSource = this.plumbGuiService.findDataSourceOfElement(dsEl.nativeElement, this.queryDef);
      this.makeDataSource(dataSource, dsEl.nativeElement);
    });
    this.instance.batch(() => { this.plumbGuiService.initWirings(this.queryDef, this.instance); }); // suspend drawing and initialise
    this.instance.repaintEverything(); // repaint so continuous connections are aligned correctly
    this.plumbGuiService.connectionsInitialized = true;
  }

  makeDataSource(dataSource: PipelineDataSource, element: HTMLElement) {
    this.plumbGuiService.makeSource(
      dataSource,
      element,
      (draggedWrapper: PlumbType) => { this.dataSourceDrag(draggedWrapper); },
      this.queryDef,
      this.instance,
    );
    this.queryDef.dsCount++;
  }

  dataSourceDrag(draggedWrapper: PlumbType) {
    const offset = this.getElementOffset(draggedWrapper.el);
    const dataSource = this.plumbGuiService.findDataSourceOfElement(draggedWrapper.el, this.queryDef);
    dataSource.VisualDesignerData.Top = Math.round(offset.top);
    dataSource.VisualDesignerData.Left = Math.round(offset.left);
  }

  configureDataSource(dataSource: PipelineDataSource) {
    if (dataSource.ReadOnly) { return; }

    // Ensure dataSource Entity is saved
    if (dataSource.EntityGuid.includes('unsaved')) {
      this.save.emit();
    } else {
      this.editDataSourcePart.emit(dataSource);
    }
  }

  typeInfo(dataSource: PipelineDataSource) {
    const typeInfo = this.queryDefinitionService.dsTypeInfo(dataSource, this.queryDef);
    return typeInfo;
  }

  typeNameFilter(input: string, format: string) {
    const filtered = this.queryDefinitionService.typeNameFilter(input, format);
    return filtered;
  }

  remove(index: number) {
    const dataSource = this.queryDef.data.DataSources[index];
    if (!confirm(`Delete DataSource ${dataSource.Name || '(unnamed)'}?`)) { return; }

    const elementId = dataSrcIdPrefix + dataSource.EntityGuid;
    this.instance.selectEndpoints({ element: elementId }).remove();
    this.queryDef.data.DataSources.splice(index, 1);
  }

  editName(dataSource: PipelineDataSource) {
    if (dataSource.ReadOnly) { return; }

    const newName = prompt('Rename DataSource', dataSource.Name)?.trim();
    if (newName != null && newName !== '') {
      dataSource.Name = newName;
    }
  }

  editDescription(dataSource: PipelineDataSource) {
    if (dataSource.ReadOnly) { return; }

    const newDescription = prompt('Edit Description', dataSource.Description)?.trim();
    if (newDescription != null) {
      dataSource.Description = newDescription;
    }
  }

  private getElementOffset(element: HTMLDivElement) {
    const container = document.getElementById('pipelineContainer') as HTMLDivElement;
    const containerBox = container.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const top = box.top + container.scrollTop - containerBox.top;
    const left = box.left + container.scrollLeft - containerBox.left;
    return { top, left };
  }

}
