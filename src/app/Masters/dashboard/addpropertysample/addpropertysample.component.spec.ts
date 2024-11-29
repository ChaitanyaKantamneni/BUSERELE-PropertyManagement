import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpropertysampleComponent } from './addpropertysample.component';

describe('AddpropertysampleComponent', () => {
  let component: AddpropertysampleComponent;
  let fixture: ComponentFixture<AddpropertysampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddpropertysampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddpropertysampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
