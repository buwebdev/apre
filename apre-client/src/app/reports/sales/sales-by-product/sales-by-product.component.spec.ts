import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesByProductComponent } from './sales-by-product.component';

describe('SalesByProductComponent', () => {
  let component: SalesByProductComponent;
  let fixture: ComponentFixture<SalesByProductComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, SalesByProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit the form if no product is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.productForm.valid).toBeFalse();
  });

  it('should display the Product and Total Sales headers within the table', () => {
    //Set mock sales data and update the template
    component.salesData = [{ product: 'Television', totalSales: 500 }];
    fixture.detectChanges();

    //Select template elements
    const table = fixture.nativeElement.querySelector('app-table');
    const headers = table.querySelectorAll('th');

    //Check header length and text content
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('Product');
    expect(headers[1].textContent).toContain('Total Sales');
  });

  it('should pass sales data to the table', () => {
    // Set mock sales data and update the template
    component.salesData = [{ Product: 'Watch', 'Total Sales': 578 }];
    fixture.detectChanges();

    // Select app-table rows
    const table = fixture.nativeElement.querySelector('app-table');
    const rows = table.querySelectorAll('tr');

    // Check data within table rows
    expect(rows[1].cells[0].textContent).toContain('Watch');
    expect(rows[1].cells[1].textContent).toContain('578');
  });
});
