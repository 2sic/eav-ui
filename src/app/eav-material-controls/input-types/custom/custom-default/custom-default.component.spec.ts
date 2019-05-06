import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDefaultComponent } from './custom-default.component';

describe('CustomDefaultComponent', () => {
  let component: CustomDefaultComponent;
  let fixture: ComponentFixture<CustomDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
