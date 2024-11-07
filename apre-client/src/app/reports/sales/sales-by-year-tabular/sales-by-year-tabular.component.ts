import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from './../../../shared/table/table.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-sales-by-year-tabular',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <h1>Sales by Year - Tabular</h1>
    <div class="year-container">
      <form class="form" [formGroup]="yearForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="year">Year</label>
          <select class="select" formControlName="year" id="year" name="year">
            @for(year of years; track year) {
            <option value="{{ year.value }}">{{ year.name }}</option>
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
          [title]="'Sales by Year - Tabular'"
          [data]="salesData"
          [headers]="['Year', 'Sales Person', 'Total Sales']"
          [sortableColumns]="['Sales Person', 'Total Sales']"
          [headerBackground]="'secondary'"
        >
        </app-table>
      </div>
      }
    </div>
  `,
  styles: `
    .year-container {
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
  `,
})
export class SalesByYearTabularComponent {
  salesData: any[] = [];
  years: any[] = [];
  errorMessage: string;

  yearForm = this.fb.group({
    year: [null, Validators.compose([Validators.required])],
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.years = this.loadYears();
    this.errorMessage = '';
  }

  loadYears() {
    return [
      { value: 2023, name: '2023' },
    ];
  }

  onSubmit() {
    const year = this.yearForm.controls['year'].value;
    this.http
      .get(`${environment.apiBaseUrl}/reports/sales/sales-by-year?year=${year}`)
      .subscribe({
        next: (data: any) => {
          this.salesData = data;
          for (let data of this.salesData) {
            data['Year'] = year;
            data['Total Sales'] = data['totalSales'];
            data['Sales Person'] = data['salesperson'];
          }

          console.log('Sales data:', this.salesData);
        },
        error: (err) => {
          console.error('Error fetching sales data:', err);
        },
      });
  }
}

