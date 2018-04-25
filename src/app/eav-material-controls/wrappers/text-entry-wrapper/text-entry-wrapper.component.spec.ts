import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEntryWrapperComponent } from './text-entry-wrapper.component';

describe('TextEntryWrapperComponent', () => {
  let component: TextEntryWrapperComponent;
  let fixture: ComponentFixture<TextEntryWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextEntryWrapperComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEntryWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
