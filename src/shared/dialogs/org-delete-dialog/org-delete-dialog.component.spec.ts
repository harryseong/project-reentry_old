import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDeleteDialogComponent } from './org-delete-dialog.component';

describe('OrgDeleteDialogComponent', () => {
  let component: OrgDeleteDialogComponent;
  let fixture: ComponentFixture<OrgDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
