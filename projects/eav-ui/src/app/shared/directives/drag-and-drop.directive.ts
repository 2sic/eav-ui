import { Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, Subscription } from 'rxjs';
import { BaseComponent } from '../components/base.component';

@Directive({ selector: '[appDragAndDrop]' })
export class DragAndDropDirective extends BaseComponent implements OnInit, OnDestroy {
  @Input() markStyle: 'outline' | 'fill' | 'shadow' = 'outline';
  /** Comma separated file types, e.g. 'txt,doc,docx' */
  @Input() allowedFileTypes = '';
  @Output() private filesDropped = new EventEmitter<File[]>();

  private element: HTMLElement;
  private dropAreaClass = 'eav-droparea';
  private markStyleClass: string;
  private dragClass = 'eav-dragover';
  private timeouts: number[] = [];

  constructor(elementRef: ElementRef, private zone: NgZone, private snackBar: MatSnackBar) {
    super();
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.markStyleClass = `eav-droparea-${this.markStyle}`;
    this.element.classList.add(this.dropAreaClass, this.markStyleClass);
    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        fromEvent<DragEvent>(this.element, 'dragover').subscribe(event => {
          event.preventDefault();
          event.stopPropagation();
          this.clearTimeouts();
          this.element.classList.add(this.dragClass);
        })
      );
      this.subscriptions.add(
        fromEvent<DragEvent>(this.element, 'dragleave').subscribe(event => {
          event.preventDefault();
          event.stopPropagation();
          this.timeouts.push(
            window.setTimeout(() => { this.element.classList.remove(this.dragClass); }, 50)
          );
        })
      );
    });
  }

  ngOnDestroy() {
    this.clearTimeouts();
    this.element.classList.remove(this.dropAreaClass, this.markStyleClass, this.dragClass);
    super.ngOnDestroy();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clearTimeouts();
    this.element.classList.remove(this.dragClass);
    const fileList = event.dataTransfer.files;
    let files = Array.from(fileList);
    files = this.filterTypes(files, this.allowedFileTypes);
    if (files.length > 0) {
      this.filesDropped.emit(files);
    }
  }

  private clearTimeouts() {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
    this.timeouts = [];
  }

  private filterTypes(files: File[], allowedFileTypes: string) {
    if (allowedFileTypes === '') { return files; }

    const allowedTypes = allowedFileTypes.split(',').map(type => type.toLocaleLowerCase());
    const filtered = files.filter(file => {
      const extIndex = file.name.lastIndexOf('.');
      if (extIndex <= 0) { return false; }
      const ext = file.name.substring(extIndex + 1).toLocaleLowerCase();
      const allowed = allowedTypes.includes(ext);
      return allowed;
    });

    if (files.length !== filtered.length) {
      const allowedTypesString = this.allowedFileTypes.replace(/\,/g, ', ');
      const message = filtered.length
        ? 'Some files were filtered out. This drop location only accepts file types: ' + allowedTypesString
        : 'This drop location only accepts file types: ' + allowedTypesString;
      this.snackBar.open(message, null, { duration: 5000 });
    }
    return filtered;
  }
}
