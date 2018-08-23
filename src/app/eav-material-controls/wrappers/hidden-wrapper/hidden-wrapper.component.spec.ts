import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HiddenWrapperComponent } from './hidden-wrapper.component';

describe('HiddenWrapperComponent', () => {
  let component: HiddenWrapperComponent;
  let fixture: ComponentFixture<HiddenWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HiddenWrapperComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HiddenWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
