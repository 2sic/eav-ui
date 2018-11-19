import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringFontIconPickerComponent } from './string-font-icon-picker.component';

describe('StringFontIconPickerComponent', () => {
  let component: StringFontIconPickerComponent;
  let fixture: ComponentFixture<StringFontIconPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StringFontIconPickerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringFontIconPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
