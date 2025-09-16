import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressDialog } from './progress-dialog';

describe('ProgressDialog', () => {
  let component: ProgressDialog;
  let fixture: ComponentFixture<ProgressDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
