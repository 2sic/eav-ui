import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldWrapperComponent } from './form-field-wrapper.component';

describe('FormFieldWrapperComponent', () => {
  let component: FormFieldWrapperComponent;
  let fixture: ComponentFixture<FormFieldWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFieldWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFieldWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
