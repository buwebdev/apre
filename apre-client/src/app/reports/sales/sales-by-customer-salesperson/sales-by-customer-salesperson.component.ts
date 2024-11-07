import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from './../../../shared/table/table.component';

@Component({
  selector: 'app-sales-by-customer-salesperson',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <h1>Sales by Customer and Salesperson</h1>
    <div class="customer-salesperson-container">
      <form class="form" [formGroup]="customerSalesPersonForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="customer">Customer</label>
          <select class="select" formControlName="customer" id="customer" name="customer">
            @for(customer of customers; track customer) {
              <option value="{{ customer }}">{{ customer }}</option>
            }
          </select>
          <br>
          <label class="label" for="salesperson">Salesperson</label>
          <select class="select" formControlName="salesperson" id="salesperson" name="salesperson">
            @for(salesperson of salespeople; track salesperson) {
              <option value="{{ salesperson }}">{{ salesperson }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if (salesData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Sales by Customer and Salesperson'"
            [data]="salesData"
            [headers]="['Customer', 'Sales Person', 'Product', 'Category', 'Sale Amount']"
            [sortableColumns]="['Sales Person', 'Product', 'Category', 'Sale Amount']"
            [headerBackground]="'secondary'"
            >
          </app-table>
        </div>
      }
      @else if (submitButton) {
        <div class="errorMessage">
          <p>No sales match the selected customer and salesperson.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .customer-salesperson-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }

    app-table {
      padding: 50px;
    }

    .errorMessage {
      border: 2px solid lightgrey;
      border-radius: 5px;
      width: 50%;
      padding: 10px;
      text-align: center;
    }
  `
})
export class SalesByCustomerSalespersonComponent {
  salesData: any[] = []; // Variable to store sales data
  customers: string[] = []; // Variable to store customers data
  salespeople: string[] = []; // Variable to store salespeople data
  submitButton = false; // Variable to control if the submit button was pressed

  // Add validations to form fields
  customerSalesPersonForm = this.fb.group({
    customer: [null, Validators.compose([Validators.required])],
    salesperson: [null, Validators.compose([Validators.required])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {
    // Query to get the customers
    this.http.get(`${environment.apiBaseUrl}/reports/sales/customers`).subscribe({
      next: (data: any) => {
        this.customers = data;
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
      }
    });
    // Query to get the salespeople
    this.http.get(`${environment.apiBaseUrl}/reports/sales/salespeople`).subscribe({
      next: (data: any) => {
        this.salespeople = data;
      },
      error: (err) => {
        console.error('Error fetching salespeople:', err);
      }
    });
  }

  onSubmit() {
    // Get the values ​​of the fields in the form
    const customer = this.customerSalesPersonForm.controls['customer'].value;
    const salesperson = this.customerSalesPersonForm.controls['salesperson'].value;

    // Query that finds sales associated with the obtained customer and salesperson.
    this.http.get(`${environment.apiBaseUrl}/reports/sales/customers-salespeople/${customer}&${salesperson}`).subscribe({
      next: (data: any) => {
        this.salesData = data;
        for (let data of this.salesData) {
          data['Customer'] = customer;
          data['Sales Person'] = salesperson;
          data['Product'] = data['product'];
          data['Category'] = data['category'];
          data['Sale Amount'] = data['saleAmount'];
        }

        console.log('Sales data:', this.salesData);
      },
      error: (err) => {
        console.error('Error fetching sales data:', err);
      }
    });
    // Returns the submit button variable as true since it was pressed.
    this.submitButton = true;
  }
}
