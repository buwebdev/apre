import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByCustomerSalespersonComponent } from './sales-by-customer-salesperson.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SalesByCustomerSalespersonComponent', () => {
  let component: SalesByCustomerSalespersonComponent;
  let fixture: ComponentFixture<SalesByCustomerSalespersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByCustomerSalespersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByCustomerSalespersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Sales by Customer and Salesperson"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');

    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Customer and Salesperson');
  });

  it('should initialize the customerSalesPersonForm with null values', () => {
    const customerControl = component.customerSalesPersonForm.controls['customer'];
    const salespersonControl = component.customerSalesPersonForm.controls['salesperson'];

    expect(customerControl.value).toBeNull();
    expect(customerControl.valid).toBeFalse();
    expect(salespersonControl.value).toBeNull();
    expect(salespersonControl.valid).toBeFalse();
  });

  it('should not submit the form if no customer and salesperson are selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.customerSalesPersonForm.valid).toBeFalse();
  });
});
