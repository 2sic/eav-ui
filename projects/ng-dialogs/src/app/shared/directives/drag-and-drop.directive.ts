import { Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Directive({ selector: '[appDragAndDrop]' })
export class DragAndDropDirective implements OnInit, OnDestroy {
  @Input() private markStyle: 'outline' | 'fill' | 'shadow' = 'outline';
  @Output() private filesDropped = new EventEmitter<FileList>();

  private element: HTMLElement;
  private dropAreaClass = 'eav-droparea';
  private markStyleClass: string;
  private dragClass = 'eav-dragover';
  private timeouts: number[] = [];
  private subscription = new Subscription();

  constructor(elementRef: ElementRef, private zone: NgZone) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.markStyleClass = `eav-droparea-${this.markStyle}`;
    this.element.classList.add(this.dropAreaClass, this.markStyleClass);
    this.zone.runOutsideAngular(() => {
      this.subscription.add(
        fromEvent(this.element, 'dragover').subscribe((event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          this.clearTimeouts();
          this.element.classList.add(this.dragClass);
        })
      );
      this.subscription.add(
        fromEvent(this.element, 'dragleave').subscribe((event: DragEvent) => {
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
    this.subscription.unsubscribe();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clearTimeouts();
    this.element.classList.remove(this.dragClass);
    const files = event.dataTransfer.files;
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
}
