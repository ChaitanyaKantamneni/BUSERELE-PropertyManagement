import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertyComponentComponent } from './add-property-component.component';

describe('AddPropertyComponentComponent', () => {
  let component: AddPropertyComponentComponent;
  let fixture: ComponentFixture<AddPropertyComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPropertyComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPropertyComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
