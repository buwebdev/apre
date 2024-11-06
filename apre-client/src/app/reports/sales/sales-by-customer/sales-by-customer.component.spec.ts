/** 
 * Developer: Meher Salim
 * File: sales-by-customer.component.ts
 * Description: Unit tests for the sales-by-customer to confirm its functionality
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { SalesByCustomerComponent } from './sales-by-customer.component';
import { By } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

describe('SalesByCustomerComponent', () => {
  let component: SalesByCustomerComponent;
  let fixture: ComponentFixture<SalesByCustomerComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByCustomerComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [FormBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByCustomerComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Test form submission
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test Case: Should have an invalid form when customer field is not filled
  it('should have an invalid form when customer field is empty', () => {
    const customerInput = component.customerForm.controls['customer'];
    customerInput.setValue('');
    expect(component.customerForm.valid).toBeFalsy();
  });

  // Test Case: Should have a valid form when customer field is filled
  it('should have a valid form when customer field is filled', () => {
    const customerInput = component.customerForm.controls['customer'];
    customerInput.setValue('Lambda LLC');
    expect(component.customerForm.valid).toBeTruthy();
  });

  // Test Case: Should reset form and clear sales data and error message on cancel
  it('should reset form and clear sales data and error message on cancel', () => {
    component.salesData = [{
      _id: "650c1f1e1c9d440000a1b1e2",
      date: "2023-10-02T00:00:00.000Z",
      region: "South",
      product: "Smartphone X",
      category: "Electronics",
      customer: "Beta LLC",
      salesperson: "Jane Smith",
      channel: "Retail",
      amount: 800
    }];
    component.errorMessage = 'Some error';
    component.onCancel();
  
    const customerValue = component.customerForm.get('customer')?.value;
    expect(customerValue).toBeNull(); // Check for null instead of ''
    expect(component.salesData.length).toBe(0);
    expect(component.errorMessage).toBe('');
  });


  // Test Case: Should fetch sales data when valid customer is submitted
  it('should fetch sales data when valid customer is submitted', fakeAsync(() => {
    const customer = 'Lambda LLC';
    component.customerForm.controls['customer'].setValue(customer);

    component.onSubmit();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/customer/${customer}`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { customer: 'Lambda LLC', amount: 150, salesperson: 'Jane Smith', channel: 'In-store' }
    ]);

    tick();
    fixture.detectChanges();
    expect(component.salesData.length).toBe(1);
    expect(component.errorMessage).toBe('');
  }));

  // Test Case: Should display error message when fetching sales data fails
  it('should display error message when fetching sales data fails', fakeAsync(() => {
    const customer = 'Lambda LLC';
    component.customerForm.controls['customer'].setValue(customer);

    component.onSubmit();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/customer/${customer}`);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    tick();
    fixture.detectChanges();
    expect(component.salesData.length).toBe(0);
    expect(component.errorMessage).toBe('Error fetching sales data. Please try again later.');
  }));

  // Test Case: Should display "No sales data available for this customer" when there is no data
  it('should display "No sales data available for this customer" when there is no data', fakeAsync(() => {
    const customer = 'Nonexistent Customer';
    component.customerForm.controls['customer'].setValue(customer);

    component.onSubmit();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/customer/${customer}`);
    req.flush([]);

    tick();
    fixture.detectChanges();
    const noDataMessage = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(noDataMessage.textContent).toContain('No sales data available for this customer.');
  }));
});
