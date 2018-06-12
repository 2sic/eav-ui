import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdamBrowserComponent } from './adam-browser.component';

describe('BrowserComponent', () => {
  let component: AdamBrowserComponent;
  let fixture: ComponentFixture<AdamBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdamBrowserComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdamBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
