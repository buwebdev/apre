/**
 * Developer: Meher Salim
 * File: sale-by-customer.component.ts
 * Description: Component to display sales data by customer
 */

import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ReactiveFormsModule, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';
import { CommonModule, formatCurrency } from '@angular/common';

interface SalesData {
  _id: string;
  date: string;
  region: string;
  product: string;
  category: string;
  customer: string;
  salesperson: string;
  channel: string;
  amount: number;
}

@Component({
  selector: 'app-sales-by-customer',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule, CommonModule],
  template: `
    <h1>Sales by Customer</h1> <!-- Title -->

    <div class="container">
      <!-- Form to filter sales by customer -->
      <form class="form" [formGroup]="customerForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="customer">Customer Name</label>
          <input formControlName="customer" class="input" type="text" id="customer" name="customer" required>
        </div>

        <!-- Submit and cancel buttons -->
        <div class="form__actions">
          <button class="button button--secondary" type="button" (click)="onCancel()">Cancel</button>
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      <!-- Sales data table -->
      <table class="table"  *ngIf="salesData.length > 0; else noData">
        <thead>
          <tr>
            <th>Customer Id</th>
            <th>Date</th>
            <th>Region</th>
            <th>Product</th>
            <th>Category</th>
            <th>Customer Name</th>
            <th>Sales Person</th>
            <th>Channel</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
           <tr *ngFor="let sale of salesData">
              <td>{{ sale._id }}</td>
              <td>{{ sale.date | date: 'shortDate' }}</td>
              <td>{{ sale.region }}</td>
              <td>{{ sale.product }}</td>
              <td>{{ sale.category }}</td>
              <td>{{ sale.customer }}</td>
              <td>{{ sale.salesperson }}</td>
              <td>{{ sale.channel }}</td>
              <td>{{ sale.amount | currency }}</td>
            </tr>
          </tbody>
      </table>
    </div>  

      <!-- No data message -->
      <ng-template #noData>
        <p>No sales data available for this customer.</p>
      </ng-template>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="message message--error" aria-live="assertive">
        {{ errorMessage }}
      </div>
  `,
})

export class SalesByCustomerComponent{
  customerForm: FormGroup;
  salesData: SalesData[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      customer: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const customer = this.customerForm.get('customer')?.value;
    if (customer) {
      this.fetchSalesDataByCustomer(customer);
    }
  }

  onCancel(): void {
    this.customerForm.reset();
    this.salesData = [];
    this.errorMessage = '';
  }

  private fetchSalesDataByCustomer(customer: string): void {
    this.loading = true;
    this.http
      .get<SalesData[]>(`${environment.apiBaseUrl}/reports/sales/customer/${customer}`)
      .subscribe({
        next: (data) => {
          console.log('Fetched data:', data);
          this.salesData = data;
          this.errorMessage = '';
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error fetching sales data:', error);
          this.errorMessage = 'Error fetching sales data. Please try again later.';
          this.salesData = [];
          this.loading = false;
        },
      });
  }
}