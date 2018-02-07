import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanDefaultComponent } from './boolean-default.component';

describe('BooleanDefaultComponent', () => {
  let component: BooleanDefaultComponent;
  let fixture: ComponentFixture<BooleanDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BooleanDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
