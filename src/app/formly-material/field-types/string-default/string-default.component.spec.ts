import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringDefaultComponent } from './string-default.component';

describe('StringDefaultComponent', () => {
  let component: StringDefaultComponent;
  let fixture: ComponentFixture<StringDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
