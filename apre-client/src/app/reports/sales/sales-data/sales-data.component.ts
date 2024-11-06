import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from './../../../shared/table/table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-data',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
  <h1>Sales Data</h1>
  <div class="sales-container">
    <form class="form" [formGroup]="salesForm" (ngSubmit)="onSubmit()">
      <div class="form__group">
        <label class="label" for="sales">Sales</label>
        <select class="select" formControlName="sales" id="sales data" name="sales data">
          @for(sale of salesData; track salesData) {
            <option value="{{ sale }}">{{ sale }}</option>
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
            [title]="'Sales'"
            [data]="salesData"
            [headers]="['Sales Person', 'Total Sales']"
            [sortableColumns]="['Sales Person', 'Total Sales']"
            [headerBackground]="'secondary'"
            >
          </app-table>
        </div>
      }
    </div>
`,
  styles: `
    .sales-container {
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
export class SalesDataComponent {
  salesData: any[] = [];



  salesForm = this.fb.group({
    sales: [null, Validators.compose([Validators.required])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.http.get(`${environment.apiBaseUrl}/reports/sales/sales-data`).subscribe({
      next: (data: any) => {
        console.log('Fetched sales data:', data);
        this.salesData = data;
      },
      error: (err) => {
        console.error('Error fetching sales data:', );
      }
    });
  }

  onSubmit() {
    const salesData = this.salesForm.controls['sales'].value;
    this.http.get(`${environment.apiBaseUrl}/reports/sales/sales-data/${salesData}`).subscribe({
      next: (data: any) => {
        this.salesData = data;
        for (let data of this.salesData) {
          data['Total Sales'] = data['totalSales'];
          data['Sales Person'] = data['salesperson'];
        }

        console.log('sales-data:', this.salesData);
      },
      error: (err) => {
        console.error('Error fetching sales data:', err);
      }
    });
  }
}

