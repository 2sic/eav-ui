import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleWrapperComponent } from './collapsible-wrapper.component';

describe('CollapsibleWrapperComponent', () => {
  let component: CollapsibleWrapperComponent;
  let fixture: ComponentFixture<CollapsibleWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollapsibleWrapperComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsibleWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
