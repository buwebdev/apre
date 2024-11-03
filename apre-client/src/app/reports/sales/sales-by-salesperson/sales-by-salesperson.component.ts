import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';

@Component({
  selector: 'app-sales-by-salesperson',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <h1>Sales by Salesperson</h1>
    <div class="salesperson-container">
      <form class="form" [formGroup]="salespersonForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="salesPerson">Salesperson</label>
          <select class="select" formControlName="salesPerson" id="salesPerson" name="salesPerson">
            @for(salesperson of salesPeople; track salesperson) {
              <option value="{{ salesperson }}">{{ salesperson }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if(salesData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="this.reportTitle"
            [data]="salesData"
            [headers]="['Category', 'Channel', 'Region', 'Total Sales Count', 'Total Sales Amount']"
            [sortableColumns]="['Category', 'Channel', 'Region', 'Total Sales Count', 'Total Sales Amount']"
            [headerBackground]="'secondary'"
          >
          </app-table>
        </div>
      }
    </div>
  `,
  styles: `
    .salesperson-container {
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
  `
})
export class SalesBySalespersonComponent {
  // Create variables
  salesData: any[] = [];  // Sales data from the database
  salesPeople: string[] = []; // Sales people from the database
  selectedSalesPerson: string | null = null; // Selected salesperson from the control
  reportTitle: string = ''; // Report title, constructed in the submit function.

  // Create a form group
  salespersonForm = this.fb.group({
    salesPerson: [null, Validators.compose([Validators.required])]
  });

  // Constructor to handle initial setup and dependency injection
  constructor(private http: HttpClient, private fb: FormBuilder) {
    // Populate the salesPeople variable from the database
    this.http.get(`${environment.apiBaseUrl}/reports/sales/salespeople`).subscribe({
      next: (data: any) => {
        this.salesPeople = data;
      },
      error: (err) => {
        console.error('Error fetching sales people:', err);
      }
    });
  }

  /**
   * @description
   *
   * onSubmit function to handle form action to generate a report.
   * This should not execute if there is no selected salesperson
   */
  onSubmit() {
    // Get the selected salesperson
    this.selectedSalesPerson = this.salespersonForm.controls['salesPerson'].value;
    // Query the database for report data
    this.http.get(`${environment.apiBaseUrl}/reports/sales/salespeople/${this.selectedSalesPerson}`).subscribe({
      next: (data: any) => {
        this.salesData = data;
        // Match the returned data to the columns of the app-table control
        for (let data of this.salesData) {
          data['Category'] = data['category'];
          data['Channel'] = data['channel'];
          data['Region'] = data['region'];
          data['Total Sales Count'] = data['salesCount'];
          data['Total Sales Amount'] = data['totalAmount'];
        }

        // Construct the report title
        this.reportTitle = "Sales by Salesperson - " + this.selectedSalesPerson;

        console.log('Sales data:', this.salesData);
      },
      error: (err) => {
        console.error('Error fetching sales data:', err);
      }
    });
  }
}
