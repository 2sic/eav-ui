import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HyperlinkDefaultPagepickerComponent } from './hyperlink-default-pagepicker.component';

describe('HyperlinkDefaultPagepickerComponent', () => {
  let component: HyperlinkDefaultPagepickerComponent;
  let fixture: ComponentFixture<HyperlinkDefaultPagepickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HyperlinkDefaultPagepickerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HyperlinkDefaultPagepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
