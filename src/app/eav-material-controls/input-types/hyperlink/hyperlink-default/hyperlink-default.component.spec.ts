import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HyperlinkDefaultComponent } from './hyperlink-default.component';

describe('HyperlinkDefaultComponent', () => {
  let component: HyperlinkDefaultComponent;
  let fixture: ComponentFixture<HyperlinkDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HyperlinkDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HyperlinkDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
