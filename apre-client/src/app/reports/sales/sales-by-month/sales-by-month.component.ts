/**
 * Author: Brandon Salvemini
 * Date: 1 November 2024
 * File: sales-by-month.component.ts
 * Description: Sales by month component
 * This component uses some code from the ChannelRatingByMonthComponent
 */
import { CommonModule, formatCurrency } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sales-by-month',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TableComponent],
  template: `
  <h1>Sales by Month</h1>
  <div class="month-container">
    <!-- Form code based on form from the ChannelRatingByMonthComponent  -->
  <form class="form" [formGroup]="monthForm" (ngSubmit)="onSubmit()">
  @if (errorMessage) {
          <div class="message message--error">{{ errorMessage }} </div>
        }

        <div class="form__group">
          <label class="label" for="month">Month</label>
          <select class="select" formControlName="month" id="month" name="month">
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
          <label for="year" class="label">Year</label>
          <input type="number" name="year" id="year" formControlName="year" min="2000" max="2024">
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
  </form>
  @if (monthlySalesData.length > 0) {
    <app-table
          [title]="'Sales by Month'"
          [data]="monthlySalesData"
          [headers]="['Date', 'Salesperson', 'Product', 'Category', 'Channel', 'Customer', 'Region', 'Amount']"
          [recordsPerPage]="10"
          [sortableColumns]="['Date', 'Salesperson', 'Product', 'Category', 'Channel', 'Customer', 'Region', 'Amount']"
          [headerBackground]="'default'">
        </app-table>
  }
  </div>
  `,
  styles: `
  .month-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
    }

    label[for=year] {
    margin-top: 5px;
    }
    input#year {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
    transition: border-color 0.3s ease;
    background-color: white;
    }`
})
export class SalesByMonthComponent {
monthForm = this.fb.group({
    month: [null, Validators.compose([Validators.required])],
    year: [null, Validators.compose([Validators.required])]
  });
  monthlySalesData: any[] = []
  errorMessage: string;

  constructor(private http: HttpClient, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.errorMessage = '';
  }
  onSubmit() {
    if (this.monthForm.invalid) {
      this.errorMessage = 'Please select a month and enter a year';
      console.log(this.errorMessage);
      return;
    }

    // Get the month and year from the form
    const month = this.monthForm.controls['month'].value;
    const year = this.monthForm.controls['year'].value;

    this.http.get(`${environment.apiBaseUrl}/reports/sales/monthly?month=${month}&year=${year}`).subscribe({
      next: (data: any) => {
        this.monthlySalesData = data; // Set the monthlySalesData array to the data received
        console.log('this.salesData: ', this.monthlySalesData);
        for(let data of this.monthlySalesData) { // Set up table
          data['Date'] = new Date (data['date']).toLocaleDateString(); // Format the date
          data['Salesperson'] = data['salesperson'];
          data['Product'] = data['product'];
          data['Category'] = data['category'];
          data['Channel'] = data['channel'];
          data['Customer'] = data['customer'];
          data['Region'] = data['region'];
          data['Amount'] = formatCurrency(data['amount'], 'en-us', '$'); // Format the amount as USD currency
        }

        this.errorMessage = ''; // Reset error message
      },
      error: (err) => {
        console.error('Error fetching monthly sales data:', err);
      }
    });
  }
}
