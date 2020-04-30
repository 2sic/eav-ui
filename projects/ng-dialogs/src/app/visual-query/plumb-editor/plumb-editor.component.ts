// tslint:disable-next-line:max-line-length
import { Component, OnInit, Input, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectionStrategy, Output, EventEmitter, OnDestroy, NgZone, OnChanges, SimpleChanges } from '@angular/core';

import { QueryDefinitionService } from '../services/query-definition.service';
import { PlumbGuiService, dataSrcIdPrefix } from '../services/plumb-gui.service';
import { ElementEventListener } from '../../../../../shared/element-event-listener-model';
declare const jsPlumb: any;

@Component({
  selector: 'app-plumb-editor',
  templateUrl: './plumb-editor.component.html',
  styles: [':host {display: block; width: 100%; height: 100%}'],
  styleUrls: ['./plumb-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlumbEditorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() queryDef: any;
  @Input() stopKeyboardSave: boolean;
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() editDataSourcePart: EventEmitter<any> = new EventEmitter();
  @Output() instanceChanged: EventEmitter<any> = new EventEmitter();
  @ViewChildren('dataSourceElement') dataSourceElements: QueryList<ElementRef>;
  instance: any;

  private eventListeners: ElementEventListener[] = [];

  constructor(
    private queryDefinitionService: QueryDefinitionService,
    private plumbGuiService: PlumbGuiService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.attachListeners();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.stopKeyboardSave?.currentValue) {
      if (this.stopKeyboardSave) {
        // spm TODO: move to parent
        this.detachListeners();
      } else {
        this.attachListeners();
      }
    }
  }

  ngOnDestroy() {
    this.detachListeners();
  }

  ngAfterViewInit() {
    // Initialize plumbing. In Angular JS this was done with ngRepeatFinished which Angular 2 doesn't provide.
    // Alternative is described here:
    // https://stackoverflow.com/questions/37087864/execute-a-function-when-ngfor-finished-in-angular-2/37088348#37088348
    // Since there is an *ngIf on <app-plumb-editor> in VisualQueryComponent, *ngFor will for sure be executed
    // before ngAfterViewInit is called so initializing plumbing shouldn't have any problems, but if there are, use solution
    // above to run plumbing initialization again if *ngFor runs again

    jsPlumb.ready(() => { this.jsPlumbReady(); });

    this.dataSourceElements.changes.subscribe(t => {
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

  makeDataSource(dataSource: any, element: HTMLElement) {
    this.plumbGuiService.makeSource(
      dataSource, element, (draggedWrapper: any) => { this.dataSourceDrag(draggedWrapper); }, this.queryDef, this.instance
    );
    this.queryDef.dsCount++; // unclear what this is for, probably to name/number new sources
  }

  dataSourceDrag(draggedWrapper: any) {
    const offset = this.getElementOffset(draggedWrapper.el);
    const dataSource = this.plumbGuiService.findDataSourceOfElement(draggedWrapper.el, this.queryDef);
    dataSource.VisualDesignerData.Top = Math.round(offset.top);
    dataSource.VisualDesignerData.Left = Math.round(offset.left);
  }

  configureDataSource(dataSource: any) {
    if (dataSource.ReadOnly) { return; }

    // Ensure dataSource Entity is saved
    if (!this.queryDefinitionService.dataSourceIsPersisted(dataSource)) {
      this.save.emit();
    } else {
      this.editDataSourcePart.emit(dataSource);
    }
  }

  typeInfo(dataSource: any) {
    const typeInfo = this.queryDefinitionService.dsTypeInfo(dataSource, this.queryDef);
    return typeInfo;
  }

  typeNameFilter(input: any, format: any) {
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

  editName(dataSource: any) {
    if (dataSource.ReadOnly) { return; }

    const newName = prompt('Rename DataSource', dataSource.Name);
    if (newName && newName.trim()) {
      dataSource.Name = newName.trim();
    }
  }

  // Edit Description of a DataSource
  editDescription(dataSource: any) {
    if (dataSource.ReadOnly) { return; }

    const newDescription = prompt('Edit Description', dataSource.Description);
    if (newDescription && newDescription.trim()) {
      dataSource.Description = newDescription.trim();
    }
  }

  // helper method to find the offset
  getElementOffset(element: any) {
    const de = document.documentElement;
    const box = element.getBoundingClientRect();
    const top = box.top + window.pageYOffset - de.clientTop;
    const left = box.left + window.pageXOffset - de.clientLeft;
    return { top, left };
  }

  private attachListeners() {
    this.zone.runOutsideAngular(() => {
      const save = this.keyboardSave.bind(this);
      window.addEventListener('keydown', save);
      this.eventListeners.push({ element: window, type: 'keydown', listener: save });
    });
  }

  private detachListeners() {
    this.zone.runOutsideAngular(() => {
      this.eventListeners.forEach(listener => {
        listener.element.removeEventListener(listener.type, listener.listener);
      });
      this.eventListeners = null;
    });
  }

  private keyboardSave(e: KeyboardEvent) {
    const CTRL_S = e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey);
    if (!CTRL_S) { return; }
    e.preventDefault();
    this.zone.run(() => {
      this.save.emit();
    });
  }

}
