import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeDefaultComponent } from './datetime-default.component';

describe('DatetimeDefaultComponent', () => {
  let component: DatetimeDefaultComponent;
  let fixture: ComponentFixture<DatetimeDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatetimeDefaultComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
