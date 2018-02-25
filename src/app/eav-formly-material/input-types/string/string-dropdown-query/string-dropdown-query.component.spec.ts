import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringDropdownQueryComponent } from './string-dropdown-query.component';

describe('StringDropdownQueryComponent', () => {
  let component: StringDropdownQueryComponent;
  let fixture: ComponentFixture<StringDropdownQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StringDropdownQueryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringDropdownQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
