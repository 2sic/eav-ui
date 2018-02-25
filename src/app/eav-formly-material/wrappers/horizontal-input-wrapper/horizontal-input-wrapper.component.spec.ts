import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalInputWrapperComponent } from './horizontal-input-wrapper.component';

describe('LabelWrapperComponent', () => {
  let component: HorizontalInputWrapperComponent;
  let fixture: ComponentFixture<HorizontalInputWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HorizontalInputWrapperComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalInputWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
