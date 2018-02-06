import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringDropdownComponent } from './string-dropdown.component';

describe('StringDropdownComponent', () => {
  let component: StringDropdownComponent;
  let fixture: ComponentFixture<StringDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
