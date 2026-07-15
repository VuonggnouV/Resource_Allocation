import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  employeeId?: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  createdAt?: string;
}

export interface EmployeeWorkload {
  employeeId: number;
  fullName: string;
  totalAllocation: number;
  availablePercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/employees';

  constructor(private http: HttpClient) {}

  getEmployees(page: number = 0, size: number = 10, filters: any = {}, sortBy: string = 'fullName', sortDir: string = 'asc'): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (filters.employeeCode) url += `&employeeCode=${encodeURIComponent(filters.employeeCode)}`;
    if (filters.fullName) url += `&fullName=${encodeURIComponent(filters.fullName)}`;
    if (filters.email) url += `&email=${encodeURIComponent(filters.email)}`;
    if (filters.role && filters.role !== 'ALL') url += `&role=${encodeURIComponent(filters.role)}`;
    if (filters.department && filters.department !== 'ALL') url += `&department=${encodeURIComponent(filters.department)}`;
    return this.http.get<any>(url);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEmployeeWorkload(id: number): Observable<EmployeeWorkload> {
    return this.http.get<EmployeeWorkload>(`${this.apiUrl}/${id}/workload`);
  }
}
