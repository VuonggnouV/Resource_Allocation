import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { AllocationsComponent } from './components/allocations/allocations.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'allocations', component: AllocationsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
