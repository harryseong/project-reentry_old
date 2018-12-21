import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgAllComponent } from './org-all.component';

describe('OrgAllComponent', () => {
  let component: OrgAllComponent;
  let fixture: ComponentFixture<OrgAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
