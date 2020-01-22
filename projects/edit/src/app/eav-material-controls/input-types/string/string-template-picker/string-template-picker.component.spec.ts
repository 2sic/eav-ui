import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringTemplatePickerComponent } from './string-template-picker.component';

describe('StringTemplatePickerComponent', () => {
  let component: StringTemplatePickerComponent;
  let fixture: ComponentFixture<StringTemplatePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringTemplatePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringTemplatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
