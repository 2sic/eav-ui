// tslint:disable-next-line:max-line-length
import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { loadScripts } from '../../shared/helpers/load-scripts.helper';
import { aceOptions } from './ace-options';
import { Ace, Editor } from './ace.model';

declare const ace: Ace;

@Component({
  selector: 'app-ace-editor',
  template: `<div style="width: 100%; height: 100%;" #editor></div>`,
  styles: [':host {display: block; width: 100%; height: 100%}'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AceEditorComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AceEditorComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('editor') editorRef: ElementRef;
  @Input() filename: string;
  @Input() snippets: any[];
  /** If value changes editor will be resized */
  @Input() toggleResize: boolean;

  private value = '';
  private editor: Editor;

  propagateChange: (_: any) => void = () => { };
  propagateTouched: (_: any) => void = () => { };

  constructor(private zone: NgZone) { }

  ngOnInit() {
    loadScripts(
      [
        { test: 'ace', src: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ace.min.js' },
        { test: null, src: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ext-modelist.min.js' },
        { test: null, src: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ext-language_tools.min.js' },
      ],
      this.aceLoaded.bind(this)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const filename = changes.filename?.currentValue;
    const snippets = changes.snippets?.currentValue;
    this.updateValues(filename, snippets);

    if (!this.editor) { return; }
    const resize = changes.toggleResize?.currentValue !== changes.toggleResize?.previousValue;
    if (resize) {
      this.zone.runOutsideAngular(() => {
        // wait for Angular to update DOM to be able to get proper size of the container
        setTimeout(() => { this.editor.resize(); }, 50);
      });
    }
  }

  insertSnippet(snippet: any) {
    this.zone.runOutsideAngular(() => {
      const snippetManager = ace.require('ace/snippets').snippetManager;
      snippetManager.insertSnippet(this.editor, snippet);
      this.editor.focus();
    });
  }

  writeValue(value: string) {
    this.value = value || '';
    if (!this.editor) { return; }
    this.zone.runOutsideAngular(() => {
      const p = this.editor.getCursorPosition();
      this.editor.setValue(this.value, -1);
      this.editor.moveCursorToPosition(p);
    });
  }

  registerOnChange(fn: (_: any) => void) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: any) => void) {
    this.propagateTouched = fn;
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      this.editor.destroy();
      this.editor.container.remove();
      this.editor = null;
    });
  }

  private aceLoaded() {
    this.zone.runOutsideAngular(() => {
      ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11');
      this.editor = ace.edit(this.editorRef.nativeElement, aceOptions);
      (this.editor as any).$blockScrolling = Infinity;
      this.editor.session.setValue(this.value); // set value and reset undo history
      this.updateValues(this.filename, this.snippets);
      this.editor.on('change', this.onEditorValueChange.bind(this));
      this.editor.on('blur', this.onEditorBlurred.bind(this));
      this.editor.focus();
    });
  }

  private onEditorValueChange() {
    this.zone.run(() => {
      this.propagateChange(this.editor.getValue());
    });
  }

  private onEditorBlurred() {
    this.zone.run(() => {
      this.propagateTouched(this.editor.getValue());
    });
  }

  private updateValues(filename: string, snippets: any[]) {
    if (!this.editor) { return; }
    this.zone.runOutsideAngular(() => {
      if (filename) {
        const modelist = ace.require('ace/ext/modelist');
        const mode = modelist.getModeForPath(filename).mode;
        this.editor.session.setMode(mode);
      }
      if (snippets) {
        const snippetManager = ace.require('ace/snippets').snippetManager;
        snippetManager.register(this.snippets);
      }
    });
  }

}
