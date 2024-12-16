import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAminities1Component } from './add-aminities1.component';

describe('AddAminities1Component', () => {
  let component: AddAminities1Component;
  let fixture: ComponentFixture<AddAminities1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAminities1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAminities1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
