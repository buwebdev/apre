import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from './../../../shared/table/table.component';

@Component({
  selector: 'app-agent-performance-by-feedback',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <h1>Agent Performance by Customer Feedback</h1>
    <div class="feedback-container">
      <form class="form" [formGroup]="agentFeedbackForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="agentId">Feedback</label>
          <select class="select" formControlName="agentId" id="agentId" name="agentId">
            @for(agentId of agentIds; track agentId) {
              <option value="{{ agentId }}">{{ agentId }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if (customerFeedback.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Agent Performance By Customer Feedback'"
            [data]="customerFeedback"
            [headers]="['Agent', 'Customer Feedback']"
            [sortableColumns]="['Customer Feedback']"
            [headerBackground]="'secondary'"
            >
          </app-table>
        </div>
      }
    </div>
  `,
  styles: `
    .feedback-container {
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
export class AgentPerformanceByCustomerFeedbackComponent {
  customerFeedback: any[] = [];
  agentIds: string[] = [];

  agentFeedbackForm = this.fb.group({
    agentId: [null, Validators.compose([Validators.required])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {
    // fetch ids to populate dropdown menu
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/agent-id`).subscribe({
      next: (data: any) => {
        this.agentIds = data;
      },
      error: (err) => {
        console.error('Error fetching agent Ids: ', err);
      }
    });
  }

  onSubmit() {
    //fetch data for specified agent Id
    const agentId = this.agentFeedbackForm.controls['agentId'].value;
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/agent-performance-by-customer-feedback/${agentId}`).subscribe({
      next: (data: any) => {
        this.customerFeedback = data;
        console.log("customerFeedback1: ", data);
        for (let data of this.customerFeedback) {
          data['Agent'] = data['agent'];
          data['Customer Feedback'] = data['feedbackScores'];
        }

        console.log('Customer Feedback Client side:', this.customerFeedback);
      },
      error: (err) => {
        console.error('Error fetching customer feedback:', err);
      }
    });
  }
}

