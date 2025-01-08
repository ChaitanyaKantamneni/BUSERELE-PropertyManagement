import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertyByUserComponent } from './add-property-by-user.component';

describe('AddPropertyByUserComponent', () => {
  let component: AddPropertyByUserComponent;
  let fixture: ComponentFixture<AddPropertyByUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPropertyByUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPropertyByUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
