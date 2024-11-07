import { Component, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// created component to display sales data by category using the chart component. Updated 11/6/2024.

@Component({
  selector: 'app-sales-by-category',
  standalone: true,
  imports: [ReactiveFormsModule, ChartComponent],
  template: `
    <h1>
      Sales by Category
    </h1>
    <div class="category-container">
      <form class="form" [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="category">Category</label>
          <select class="select" formControlName="category" id="category" name="category">
            @for(category of categories; track category) {
              <option value="{{ category }}">{{ category }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if (totalSales.length) {
        <div class="card chart-card">
          <app-chart
            [type]="'bar'"
            [label]="'Sales by Category'"
            [data]="totalSales"
            [labels]="[selectedCategory]">
          </app-chart>
        </div>
      }
    </div>
  `,
  styles: `
  .category-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
    }
  `
})
export class SalesByCategoryComponent implements AfterViewInit {
  totalSales: number[] = [];
  selectedCategory: string = '';
  categories: string[]= [];

  categoryForm = this.fb.group({
    category: [null, Validators.compose([Validators.required])]
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.http.get(`${environment.apiBaseUrl}/reports/sales/categories`).subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // No need to create chart here, it will be handled by ChartComponent
  }

  onSubmit() {
    const category = this.categoryForm.controls['category'].value;
    this.http.get(`${environment.apiBaseUrl}/reports/sales/categories/${category}`).subscribe({
      next: (data: any) => {
        this.totalSales = data.map((s: any) => s.totalSales);

        console.log('totalSales', this.totalSales);

        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error getting sales data for category:', err);
      }
    });
  }
}
