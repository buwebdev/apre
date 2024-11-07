/**
 * Author: Professor Krasso
 * Date: 8/8/2024
 * File: app.routes.ts
 * Description: Application routes
 */

// Import the necessary modules
import { Routes } from '@angular/router';
import { DemoComponent } from './demo/demo.component';
import { SigninComponent } from './security/signin/signin.component';
import { authGuard } from './security/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SupportComponent } from './support/support.component';
import { FaqComponent } from './faq/faq.component';
import { UsersComponent } from './admin/user-management/users/users.component';
import { UserDetailsComponent } from './admin/user-management/user-details/user-details.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { UserCreateComponent } from './admin/user-management/user-create/user-create.component';
import { SalesByRegionComponent } from './reports/sales/sales-by-region/sales-by-region.component';
import { SalesComponent } from './reports/sales/sales.component';
import { AgentPerformanceComponent } from './reports/agent-performance/agent-performance.component';
import { CallDurationByDateRangeComponent } from './reports/agent-performance/call-duration-by-date-range/call-duration-by-date-range.component';
import { ChannelRatingByMonthComponent } from './reports/customer-feedback/channel-rating-by-month/channel-rating-by-month.component';
import { CustomerFeedbackComponent } from './reports/customer-feedback/customer-feedback.component';
import { SalesByRegionTabularComponent } from './reports/sales/sales-by-region-tabular/sales-by-region-tabular.component';
//import sales by product component
import { SalesByProductComponent } from './reports/sales/sales-by-product/sales-by-product.component';
import { SalesBySalespersonComponent } from './reports/sales/sales-by-salesperson/sales-by-salesperson.component';
import { SalesByYearTabularComponent } from './reports/sales/sales-by-year-tabular/sales-by-year-tabular.component';
import { SalesByMonthComponent } from './reports/sales/sales-by-month/sales-by-month.component';

// Export user-management routes
export const userManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'users/new',
    component: UserCreateComponent
  },
  {
    path: 'users/:id',
    component: UserDetailsComponent
  }
]

// Sales reports routes
export const salesReportRoutes: Routes = [
  {
    path: 'sales-by-region',
    component: SalesByRegionComponent
  },
  {
    path: 'sales-by-region-tabular',
    component: SalesByRegionTabularComponent
  },
  //Add route to sales-by-product
  {
    path: 'sales-by-product',
    component: SalesByProductComponent
  },
  // Added route for sales-by-salesperson component
  {
    path: 'sales-by-salesperson',
    component: SalesBySalespersonComponent
  },
  {
    path: 'sales-by-year-tabular',
    component: SalesByYearTabularComponent
  },
  {
    path: 'sales-by-month',
    component: SalesByMonthComponent
  }
];

// Agent performance routes
export const agentPerformanceRoutes: Routes = [
  {
    path: 'call-duration-by-date-range',
    component: CallDurationByDateRangeComponent
  }
];

// Customer feedback routes
export const customerFeedbackRoutes: Routes = [
  {
    path: 'channel-rating-by-month',
    component: ChannelRatingByMonthComponent
  }
];

// Export the routes
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'demo',
        component: DemoComponent
      },
      {
        path: 'support',
        component: SupportComponent
      },
      {
        path: 'faq',
        component: FaqComponent
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
        children: userManagementRoutes
      },
      {
        path: 'reports/sales',
        component: SalesComponent,
        children: salesReportRoutes
      },
      {
        path: 'reports/agent-performance',
        component: AgentPerformanceComponent,
        children: agentPerformanceRoutes
      },
      {
        path: 'reports/customer-feedback',
        component: CustomerFeedbackComponent,
        children: customerFeedbackRoutes
      }
    ],
    canActivate: [authGuard]
  },
  {
    path: 'signin',
    component: SigninComponent
  }
];
