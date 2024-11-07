import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';

@Component({
  selector: 'app-sales-by-product',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
  <h1>Sales by Product</h1>
  <div class="product-container">
    <form class="form" [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <div class="form__group">
        <label class="label" for="product">Product</label>
        <select class="select" formControlName="product" id="product" name="product">
          @for(product of products; track product) {
            <option value="{{ product }}">{{ product }}</option>
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
          [title]="'Sales By Product'"
          [data]="salesData"
          [headers]="['Product', 'Total Sales']"
          [sortableColumns]="['Total Sales']"
          [headerBackground]="'secondary'"
          >
        </app-table>
      </div>
    }
  </div>
  `,
  styles: `
  .product-container {
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
export class SalesByProductComponent {
  //Array to hold list of products
  products: string[] = [];
  //Array to hold sales data
  salesData: any[] = [];

  //Initialize form
  productForm = this.fb.group({
    product: [null, Validators.compose([Validators.required])]
  });

  //Use HttpClient to make HTTP request
  constructor(private http: HttpClient, private fb: FormBuilder) {
    //make a GET request to the endpoint to fetch list of products
    //This is where I'm getting 404 error 'Error fetching products'
    //I believe something is incorrect with my routes, but I have yet to identify it
    this.http.get(`${environment.apiBaseUrl}/reports/sales/products`).subscribe({
      next: (data: any) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error fetching products', err);
      }
    });
  }

  //Handle form submission
  onSubmit() {
    //Retrieve selected product
    const product = this.productForm.controls['product'].value;

    //Error if no product is selected.
    if(!product) {
      console.error('No selected product');
      return;
    }
    //Fetch sales data
    this.http.get(`${environment.apiBaseUrl}/reports/sales/products/${encodeURIComponent(product)}`).subscribe({
      next: (data: any) => {
        this.salesData = data;
        //Iterate through sales data and set Product name and Total Sales
        for (let data of this.salesData) {
          data['Product'] = product;
          data['Total Sales'] = data['totalSales'];
        }

        console.log('Sales data: ', this.salesData);
      },
      //Error handling
      error: (err) => {
        console.error('Error fetching sales data: ', err);
      }
    });
  }
}
